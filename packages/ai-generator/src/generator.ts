import { validateSiteSpec } from "@webomate/site-spec";
import type { SiteSpec } from "@webomate/site-spec";
import { SYSTEM_PROMPT } from "./prompt.js";
import type { GenerateOptions, GenerateResult, LLMProvider } from "./types.js";

// ── OpenAI ─────────────────────────────────────────────────────────────────────

async function callOpenAI(userPrompt: string, apiKey: string, model: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API 錯誤 ${response.status}: ${errText}`);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };
  return data.choices[0]?.message?.content ?? "";
}

// ── Anthropic ──────────────────────────────────────────────────────────────────

async function callAnthropic(userPrompt: string, apiKey: string, model: string): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API 錯誤 ${response.status}: ${errText}`);
  }

  const data = (await response.json()) as {
    content: { type: string; text: string }[];
  };
  return data.content.find((c) => c.type === "text")?.text ?? "";
}

// ── Core ───────────────────────────────────────────────────────────────────────

function stripMarkdownFences(raw: string): string {
  return raw
    .replace(/^```(?:json)?\n?/m, "")
    .replace(/\n?```$/m, "")
    .trim();
}

function detectProvider(opts: GenerateOptions): { provider: LLMProvider; key: string } {
  if (
    opts.provider === "openai" ||
    (!opts.provider && (opts.openaiApiKey ?? process.env["OPENAI_API_KEY"]))
  ) {
    const key = opts.openaiApiKey ?? process.env["OPENAI_API_KEY"];
    if (!key) throw new Error("需要 OPENAI_API_KEY");
    return { provider: "openai", key };
  }
  if (
    opts.provider === "anthropic" ||
    (!opts.provider && (opts.anthropicApiKey ?? process.env["ANTHROPIC_API_KEY"]))
  ) {
    const key = opts.anthropicApiKey ?? process.env["ANTHROPIC_API_KEY"];
    if (!key) throw new Error("需要 ANTHROPIC_API_KEY");
    return { provider: "anthropic", key };
  }
  throw new Error(
    "請設定 OPENAI_API_KEY 或 ANTHROPIC_API_KEY 環境變數，或在選項中傳入 openaiApiKey / anthropicApiKey。"
  );
}

/**
 * 從自然語言描述產生 SiteSpec。
 *
 * @example
 * ```ts
 * import { generateSiteSpec } from "@webomate/ai-generator";
 *
 * const result = await generateSiteSpec({
 *   prompt: "一家台北的義式咖啡廳，主色深棕色，自然溫暖風格",
 *   onProgress: (msg) => console.log(msg),
 * });
 * console.log(result.spec);
 * ```
 */
export async function generateSiteSpec(opts: GenerateOptions): Promise<GenerateResult> {
  const maxRetries = opts.maxRetries ?? 3;
  const log = opts.onProgress ?? (() => undefined);

  const { provider, key } = detectProvider(opts);
  const openaiModel = opts.openaiModel ?? "gpt-4o";
  const anthropicModel = opts.anthropicModel ?? "claude-opus-4-5";

  let currentPrompt = opts.prompt;

  for (let i = 1; i <= maxRetries; i++) {
    log(`正在呼叫 ${provider}（嘗試 ${i}/${maxRetries}）...`);

    let raw: string;
    try {
      if (provider === "openai") {
        raw = await callOpenAI(currentPrompt, key, openaiModel);
      } else {
        raw = await callAnthropic(currentPrompt, key, anthropicModel);
      }
    } catch (err) {
      if (i === maxRetries) throw err;
      const wait = i * 2000;
      log(`API 呼叫失敗，${wait / 1000}s 後重試...`);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }

    raw = stripMarkdownFences(raw);

    let spec: SiteSpec;
    try {
      spec = JSON.parse(raw) as SiteSpec;
    } catch {
      if (i === maxRetries) {
        throw new Error(`JSON 解析失敗，原始輸出：${raw.slice(0, 200)}`);
      }
      log("JSON 解析失敗，重試中...");
      continue;
    }

    const errors = validateSiteSpec(spec);
    if (errors.length === 0) {
      log("✓ SiteSpec 驗證通過。");
      return { spec, provider, attempts: i };
    }

    log(`驗證失敗（${errors.join("; ")}），請求 LLM 修正...`);

    if (i < maxRetries) {
      currentPrompt =
        `以下是你上次輸出的 JSON，但驗證失敗，錯誤為：${errors.join("; ")}。\n` +
        `請修正所有錯誤並重新輸出符合規格的完整 JSON：\n${raw}`;
    }
  }

  throw new Error(`多次嘗試後仍無法產生合格的 SiteSpec，請修改描述後重試。`);
}
