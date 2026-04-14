import { fixtures } from "@webomate/site-spec";
import type { SiteSpec } from "@webomate/site-spec";
import { validateSiteSpec } from "@webomate/site-spec";
import type { AppConfig } from "./config.js";

interface DifyResponse {
  answer?: string;
}

function fallbackSpec(userText: string): SiteSpec {
  const base = fixtures.farmBrand as SiteSpec;
  return {
    ...base,
    hero: {
      ...base.hero,
      description: userText
    }
  };
}

export async function generateSiteSpecFromDify(
  config: AppConfig,
  userText: string,
  conversationId?: string
): Promise<{ siteSpec: SiteSpec; conversationId?: string }> {
  if (!config.DIFY_API_URL || !config.DIFY_API_KEY) {
    return { siteSpec: fallbackSpec(userText), conversationId };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  let response: Response;
  try {
    response = await fetch(`${config.DIFY_API_URL}/chat-messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.DIFY_API_KEY}`
      },
      body: JSON.stringify({
        query: userText,
        response_mode: "blocking",
        conversation_id: conversationId,
        user: "line-user"
      }),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`Dify API error: ${response.status}`);
  }

  const payload = (await response.json()) as DifyResponse & { conversation_id?: string };
  if (!payload.answer) {
    throw new Error("Dify answer is empty");
  }

  let parsed: SiteSpec;
  try {
    parsed = JSON.parse(payload.answer) as SiteSpec;
  } catch {
    throw new Error("Dify answer is not valid JSON");
  }

  const schemaErrors = validateSiteSpec(parsed);
  if (schemaErrors.length > 0) {
    throw new Error(`Dify answer failed schema validation: ${schemaErrors.join(", ")}`);
  }

  return {
    siteSpec: parsed,
    conversationId: payload.conversation_id
  };
}
