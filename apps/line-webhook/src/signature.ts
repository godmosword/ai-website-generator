import { createHmac, timingSafeEqual } from "node:crypto";

export function validateLineSignature(
  body: string,
  signatureHeader: string | undefined,
  channelSecret: string
): boolean {
  if (!signatureHeader) {
    return false;
  }

  const expected = createHmac("SHA256", channelSecret).update(body).digest("base64");
  const signature = Buffer.from(signatureHeader, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  if (signature.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(signature, expectedBuffer);
}
