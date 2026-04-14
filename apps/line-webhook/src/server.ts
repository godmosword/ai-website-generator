import { createServer } from "node:http";
import type { IncomingMessage } from "node:http";
import type { WebhookEvent } from "@line/bot-sdk";
import { z } from "zod";
import { getConfig } from "./config.js";
import { handleWebhookEvent } from "./handler.js";
import { createLineClient } from "./line-client.js";
import { enqueue } from "./queue.js";
import { validateLineSignature } from "./signature.js";

const textMessageEventSchema = z.object({
  type: z.literal("message"),
  replyToken: z.string(),
  source: z.object({
    userId: z.string().optional(),
    groupId: z.string().optional(),
    roomId: z.string().optional(),
    type: z.string()
  }),
  message: z.object({
    type: z.literal("text"),
    id: z.string().optional(),
    text: z.string()
  })
});

const webhookPayloadSchema = z.object({
  events: z.array(z.unknown())
});

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;
    const maxBytes = 1_000_000;

    req.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    req.on("data", (chunk: Buffer) => {
      totalBytes += chunk.length;
      if (totalBytes > maxBytes) {
        reject(new Error("payload_too_large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

const config = getConfig();
const lineClient = createLineClient(config);

const server = createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (req.method !== "POST" || req.url !== "/webhook") {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "not_found" }));
    return;
  }

  let rawBody: string;
  try {
    rawBody = await readBody(req);
  } catch (error) {
    const status = error instanceof Error && error.message === "payload_too_large" ? 413 : 400;
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: status === 413 ? "payload_too_large" : "invalid_request" }));
    return;
  }

  const signature = req.headers["x-line-signature"];
  const headerValue = Array.isArray(signature) ? signature[0] : signature;

  if (!validateLineSignature(rawBody, headerValue, config.LINE_CHANNEL_SECRET)) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "invalid_signature" }));
    return;
  }

  let payload: z.infer<typeof webhookPayloadSchema>;
  try {
    payload = webhookPayloadSchema.parse(JSON.parse(rawBody));
  } catch {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "invalid_json" }));
    return;
  }

  const parsedEvents = payload.events
    .map((event) => textMessageEventSchema.safeParse(event))
    .filter((result) => result.success)
    .map((result) => result.data as WebhookEvent);

  for (const event of parsedEvents) {
    const accepted = enqueue(async () => {
      await handleWebhookEvent(event, lineClient, config);
    });
    if (!accepted) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "queue_is_full" }));
      return;
    }
  }

  // 先快速回 200，避免 LINE webhook timeout。
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ accepted: true }));
});

server.listen(config.PORT, () => {
  console.log(`line-webhook listening on :${config.PORT}`);
});
