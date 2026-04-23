#!/usr/bin/env node
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { mkdir, readFile, writeFile, watch } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { validateSiteSpec, siteSpecJsonSchema } from "@webomate/site-spec";
import type { SiteSpec } from "@webomate/site-spec";
import { renderSinglePage, renderMultiPage } from "@webomate/renderer";

const [, , command, ...args] = process.argv;

async function main() {
  switch (command) {
    case "init":
      await cmdInit(args[0] ?? "my-site");
      break;
    case "validate":
      await cmdValidate(args[0]);
      break;
    case "build":
      await cmdBuild(args[0]);
      break;
    case "preview":
      await cmdPreview(args[0]);
      break;
    case "generate":
      await cmdGenerate(args.join(" "));
      break;
    case "publish":
      await cmdPublish(args[0]);
      break;
    default:
      printHelp();
      process.exit(command ? 1 : 0);
  }
}

function printHelp() {
  process.stdout.write(
    `webomate <command> [options]

Commands:
  init <slug>              新建 sites/<slug>/site-spec.json 範本
  validate <spec-file>     驗證 site-spec.json 格式
  build <spec-file>        將 site-spec.json 轉成 HTML（支援多頁，輸出至同目錄）
  preview <spec-file>      啟動本機預覽伺服器（預設 port 3000，支援熱重載）
  generate <prompt>        透過 LLM 從自然語言描述產生網站（需設定 OPENAI_API_KEY 或 ANTHROPIC_API_KEY）
  publish <spec-file>      推送更新並觸發 GitHub Actions 部署
`
  );
}

// ── init ──────────────────────────────────────────────────────────────────────

async function cmdInit(slug: string) {
  const dir = path.resolve("sites", slug);
  await mkdir(dir, { recursive: true });
  const dest = path.join(dir, "site-spec.json");

  const template: SiteSpec = {
    slug,
    brandName: "品牌名稱",
    hero: {
      title: "主標題",
      subtitle: "副標題",
      description: "品牌一句話描述。"
    },
    sections: [
      {
        id: "about",
        heading: "關於我們",
        body: "填入段落內容。"
      },
      {
        id: "features",
        heading: "核心特色",
        body: "我們提供以下服務：",
        variant: "features",
        items: [
          { label: "特色一", description: "說明文字", icon: "✨" },
          { label: "特色二", description: "說明文字", icon: "🚀" },
          { label: "特色三", description: "說明文字", icon: "💎" }
        ]
      }
    ],
    ctas: [{ label: "了解更多", url: "https://example.com", style: "primary" }],
    links: [],
    contact: { address: "", phone: "", email: "" },
    seo: {
      title: "品牌名稱｜副標題",
      description: "SEO 描述文字。",
      keywords: ["關鍵字"]
    },
    theme: {
      tone: "business",
      primaryColor: "#2563EB",
      secondaryColor: "#DBEAFE",
      fontFamily: "Noto Sans TC",
      darkMode: false
    }
  };

  await writeFile(dest, JSON.stringify(template, null, 2) + "\n", "utf8");
  process.stdout.write(`已建立 ${dest}\n`);
}

// ── validate ──────────────────────────────────────────────────────────────────

async function cmdValidate(specPath: string | undefined) {
  const resolved = resolveSpecPath(specPath);
  const spec = await loadSpec(resolved);
  const errors = validateSiteSpec(spec);
  if (errors.length === 0) {
    process.stdout.write(`✓ ${resolved} 驗證通過\n`);
  } else {
    process.stderr.write(`✗ 驗證失敗：\n${errors.map((e) => `  - ${e}`).join("\n")}\n`);
    process.exit(1);
  }
}

// ── build ─────────────────────────────────────────────────────────────────────

async function cmdBuild(specPath: string | undefined) {
  const resolved = resolveSpecPath(specPath);
  const spec = await loadSpec(resolved);
  const dir = path.dirname(resolved);

  if (spec.pages?.length) {
    const pages = renderMultiPage(spec);
    for (const page of pages) {
      if (page.slug === "index") {
        const outPath = path.join(dir, "index.html");
        await writeFile(outPath, page.html, "utf8");
        process.stdout.write(`✓ 已輸出 ${outPath}\n`);
      } else {
        const subDir = path.join(dir, page.slug);
        await mkdir(subDir, { recursive: true });
        const outPath = path.join(subDir, "index.html");
        await writeFile(outPath, page.html, "utf8");
        process.stdout.write(`✓ 已輸出 ${outPath}\n`);
      }
    }
  } else {
    const html = renderSinglePage(spec);
    const outPath = path.join(dir, "index.html");
    await writeFile(outPath, html, "utf8");
    process.stdout.write(`✓ 已輸出 ${outPath}\n`);
  }
}

// ── preview (with HMR via SSE) ────────────────────────────────────────────────

async function cmdPreview(specPath: string | undefined) {
  const resolved = resolveSpecPath(specPath);
  const port = Number(process.env["PORT"] ?? 3000);

  const sseClients = new Set<ServerResponse>();

  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    if (req.url === "/__hmr") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*"
      });
      res.write("data: connected\n\n");
      sseClients.add(res);
      req.on("close", () => sseClients.delete(res));
      return;
    }

    try {
      const spec = await loadSpec(resolved);
      let html = renderSinglePage(spec);
      // Inject HMR client snippet before </body>
      html = html.replace(
        "</body>",
        `<script>
          (function(){
            var es = new EventSource('/__hmr');
            es.addEventListener('reload', function(){ location.reload(); });
          })();
        </script></body>`
      );
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(err instanceof Error ? err.message : String(err));
    }
  });

  server.listen(port, () => {
    process.stdout.write(`預覽伺服器啟動：http://localhost:${port}\n`);
    process.stdout.write(`監聽 ${resolved}（存檔即自動重新整理）\n`);
    process.stdout.write(`Ctrl+C 停止\n`);
  });

  // File watcher — SSE push on change
  try {
    const watcher = watch(resolved, { persistent: true });
    for await (const _ev of watcher) {
      void _ev;
      sseClients.forEach((client) => {
        try {
          client.write("event: reload\ndata: 1\n\n");
        } catch {
          sseClients.delete(client);
        }
      });
    }
  } catch {
    // fs.watch not available on some environments — silently skip
  }
}

// ── generate ──────────────────────────────────────────────────────────────────

async function cmdGenerate(prompt: string) {
  if (!prompt) {
    process.stderr.write(
      '錯誤：請提供網站描述，例如：webomate generate "咖啡廳官網，溫暖自然風"\n'
    );
    process.exit(1);
  }

  const openaiKey = process.env["OPENAI_API_KEY"];
  const anthropicKey = process.env["ANTHROPIC_API_KEY"];

  if (!openaiKey && !anthropicKey) {
    process.stderr.write(
      "錯誤：請設定 OPENAI_API_KEY 或 ANTHROPIC_API_KEY 環境變數。\n" +
        "  export OPENAI_API_KEY=sk-...\n" +
        "  export ANTHROPIC_API_KEY=sk-ant-...\n"
    );
    process.exit(1);
  }

  process.stdout.write(`🤖 正在根據描述產生網站規格：「${prompt}」\n`);

  let spec: SiteSpec;
  if (openaiKey) {
    spec = await generateWithOpenAI(prompt, openaiKey);
  } else {
    spec = await generateWithAnthropic(prompt, anthropicKey!);
  }

  const dir = path.resolve("sites", spec.slug);
  await mkdir(dir, { recursive: true });
  const specPath = path.join(dir, "site-spec.json");
  await writeFile(specPath, JSON.stringify(spec, null, 2) + "\n", "utf8");
  process.stdout.write(`✓ SiteSpec 已儲存至 ${specPath}\n`);

  const html = renderSinglePage(spec);
  const htmlPath = path.join(dir, "index.html");
  await writeFile(htmlPath, html, "utf8");
  process.stdout.write(`✓ HTML 已輸出至 ${htmlPath}\n`);
  process.stdout.write(`\n啟動預覽：webomate preview ${specPath}\n`);
}

// ── publish ───────────────────────────────────────────────────────────────────

async function cmdPublish(specPath: string | undefined) {
  const resolved = resolveSpecPath(specPath);
  const spec = await loadSpec(resolved);

  process.stdout.write(`📤 正在準備發佈 ${spec.slug}...\n`);

  // Build latest HTML first
  await cmdBuild(specPath);

  // Git operations via child_process
  const { execSync } = await import("node:child_process");
  try {
    execSync(`git add sites/${spec.slug}`, { stdio: "inherit" });
    execSync(`git commit -m "chore: update site-spec for ${spec.slug}"`, { stdio: "inherit" });
    execSync("git push", { stdio: "inherit" });
    process.stdout.write(`✓ 已推送至 GitHub，部署 Pipeline 將自動觸發。\n`);
  } catch (err) {
    process.stderr.write(`git 操作失敗：${String(err)}\n`);
    process.exit(1);
  }
}

// ── LLM helpers ───────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `你是 Webomate 的網站規格產生器。你必須輸出單一 JSON 物件，不可輸出 markdown 或多餘說明。
規格（對齊 @webomate/site-spec v0.2.0）：
1) 必要頂層欄位：slug, brandName, hero, sections, ctas, links, contact, seo, theme。
2) 所有 url 必須是 https:// 開頭。
3) slug 只允許小寫英文、數字與連字號（^[a-z0-9-]+$）。
4) theme.primaryColor / theme.secondaryColor 必須是 #RRGGBB 格式。
5) theme.tone 必須是 "natural" | "minimal" | "business" | "bold" | "elegant" 之一。
6) theme.darkMode 可選，為 boolean。
7) sections / ctas 各至少 1 筆；seo.keywords 至少 1 筆。
8) ctas[].style 只允許 "primary" | "secondary" | "ghost"。
9) links[].icon 只允許 "facebook" | "instagram" | "line" | "linkedin" | "map" | "custom"（可省略）。
10) sections 支援 variant 欄位（"text" | "features" | "faq" | "stats"），搭配 items[] 陣列。
    items 每筆包含 label（必填）、value（可選）、description（可選）、icon（可選，emoji）。
11) hero / seo / sections 文案請使用繁體中文，且要具體有說服力，不要使用佔位符文字。
12) 請根據品牌產業選擇最合適的 tone 與色彩。自然農業選 natural，科技/服務選 business，設計/藝術選 elegant，時尚/音樂選 bold，簡約品牌選 minimal。
13) logoUrl（可選）：品牌 logo 圖片 URL，必須是 https://。
14) hero.imageUrl（可選）：Hero 區塊插圖 URL，必須是 https://。
15) seo.ogImageUrl（可選）：社群分享預覽圖 URL，必須是 https://。
16) 若品牌需要多頁，可加入可選的 pages 陣列，每筆需包含 slug、title、hero、sections、seo。
17) 嚴禁輸出 schema 之外欄位；嚴禁換行以外的控制字元。`;

async function callLLM(
  prompt: string,
  apiKey: string,
  provider: "openai" | "anthropic"
): Promise<string> {
  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      let rawJson: string;

      if (provider === "openai") {
        const body = JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        });

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
          },
          body
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`OpenAI API 錯誤 ${response.status}: ${errText}`);
        }

        const data = (await response.json()) as {
          choices: { message: { content: string } }[];
        };
        rawJson = data.choices[0]?.message?.content ?? "";
      } else {
        const body = JSON.stringify({
          model: "claude-opus-4-5",
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: prompt }]
        });

        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01"
          },
          body
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Anthropic API 錯誤 ${response.status}: ${errText}`);
        }

        const data = (await response.json()) as {
          content: { type: string; text: string }[];
        };
        rawJson = data.content.find((c) => c.type === "text")?.text ?? "";
      }

      // Strip markdown code fences if present
      rawJson = rawJson
        .replace(/^```(?:json)?\n?/m, "")
        .replace(/\n?```$/m, "")
        .trim();

      return rawJson;
    } catch (err) {
      if (attempt === MAX_RETRIES) throw err;
      const wait = attempt * 2000;
      process.stdout.write(`  嘗試 ${attempt}/${MAX_RETRIES} 失敗，${wait / 1000}s 後重試...\n`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }

  throw new Error("LLM 呼叫失敗");
}

async function generateWithOpenAI(prompt: string, apiKey: string): Promise<SiteSpec> {
  return generateAndValidate(prompt, apiKey, "openai");
}

async function generateWithAnthropic(prompt: string, apiKey: string): Promise<SiteSpec> {
  return generateAndValidate(prompt, apiKey, "anthropic");
}

async function generateAndValidate(
  prompt: string,
  apiKey: string,
  provider: "openai" | "anthropic"
): Promise<SiteSpec> {
  const MAX_VALIDATE_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_VALIDATE_RETRIES; attempt++) {
    process.stdout.write(`  正在呼叫 ${provider} (嘗試 ${attempt}/${MAX_VALIDATE_RETRIES})...\n`);
    const raw = await callLLM(prompt, apiKey, provider);

    let spec: SiteSpec;
    try {
      spec = JSON.parse(raw) as SiteSpec;
    } catch {
      process.stdout.write(`  JSON 解析失敗，重試中...\n`);
      continue;
    }

    const errors = validateSiteSpec(spec);
    if (errors.length === 0) {
      process.stdout.write(`  ✓ 規格驗證通過。\n`);
      return spec;
    }

    process.stdout.write(`  驗證失敗（${errors.join(", ")}），請 LLM 修正後重試...\n`);

    // Feed errors back to LLM for self-correction
    prompt =
      `以下是你上次輸出的 JSON，但驗證失敗，錯誤為：${errors.join("; ")}。\n` +
      `請修正並重新輸出符合規格的完整 JSON：\n${raw}`;
  }

  throw new Error("多次嘗試後仍無法產生合格的 SiteSpec，請修改描述後重試。");
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function resolveSpecPath(p: string | undefined): string {
  if (!p) {
    process.stderr.write("錯誤：請提供 site-spec.json 路徑\n");
    printHelp();
    process.exit(1);
  }
  return path.resolve(p);
}

async function loadSpec(specPath: string): Promise<SiteSpec> {
  if (!existsSync(specPath)) {
    process.stderr.write(`錯誤：找不到檔案 ${specPath}\n`);
    process.exit(1);
    throw new Error("unreachable");
  }
  let raw: string;
  try {
    raw = await readFile(specPath, "utf8");
  } catch {
    process.stderr.write(`錯誤：無法讀取 ${specPath}\n`);
    process.exit(1);
    throw new Error("unreachable");
  }
  try {
    return JSON.parse(raw) as SiteSpec;
  } catch {
    process.stderr.write(`錯誤：${specPath} 不是合法的 JSON\n`);
    process.exit(1);
    throw new Error("unreachable");
  }
}

export { siteSpecJsonSchema };

await main();
