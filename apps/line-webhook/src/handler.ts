import type { Client, WebhookEvent } from "@line/bot-sdk";
import type { AppConfig } from "./config.js";
import { generateSiteSpecFromDify } from "./dify.js";
import { replyMessage, pushMessage } from "./line-client.js";
import { createErrorMessage, createPreviewFlex, createProcessingMessage } from "./messages.js";
import { publishSiteArtifact } from "./site-publisher.js";

const conversationMap = new Map<string, string>();

function getUserId(event: WebhookEvent): string | undefined {
  if (!("source" in event)) {
    return undefined;
  }

  if ("userId" in event.source) {
    return event.source.userId;
  }

  return undefined;
}

export async function handleWebhookEvent(
  event: WebhookEvent,
  lineClient: Client,
  config: AppConfig
): Promise<void> {
  if (event.type !== "message" || event.message.type !== "text") {
    return;
  }

  const userId = getUserId(event);
  if (!userId) {
    return;
  }

  const text = event.message.text.trim();

  try {
    await replyMessage(lineClient, event, createProcessingMessage());

    const previousConversationId = conversationMap.get(userId);
    const { siteSpec, conversationId } = await generateSiteSpecFromDify(
      config,
      text,
      previousConversationId
    );

    if (conversationId) {
      conversationMap.set(userId, conversationId);
    }

    const previewUrl = await publishSiteArtifact(config, siteSpec);
    await pushMessage(lineClient, userId, createPreviewFlex(previewUrl));
  } catch (error) {
    const code = error instanceof Error && error.message.includes("Dify") ? "DIFY_ERROR" : "BUILD_ERROR";
    await pushMessage(lineClient, userId, createErrorMessage(code));
  }
}
