import { Client } from "@line/bot-sdk";
import type { Message, WebhookEvent } from "@line/bot-sdk";
import type { AppConfig } from "./config.js";

export function createLineClient(config: AppConfig): Client {
  return new Client({
    channelAccessToken: config.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: config.LINE_CHANNEL_SECRET
  });
}

export async function replyMessage(
  client: Client,
  event: WebhookEvent,
  message: Message | Message[]
): Promise<void> {
  if (!("replyToken" in event) || !event.replyToken) {
    return;
  }

  await client.replyMessage(event.replyToken, Array.isArray(message) ? message : [message]);
}

export async function pushMessage(
  client: Client,
  userId: string,
  message: Message | Message[]
): Promise<void> {
  await client.pushMessage(userId, Array.isArray(message) ? message : [message]);
}
