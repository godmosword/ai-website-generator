import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(8787),
  LINE_CHANNEL_ACCESS_TOKEN: z.string().min(1),
  LINE_CHANNEL_SECRET: z.string().min(1),
  LINE_BASE_URL: z.string().url().default("https://api.line.me"),
  DIFY_API_URL: z.string().url().optional(),
  DIFY_API_KEY: z.string().optional(),
  PUBLIC_BASE_URL: z.string().url().default("https://example.com/sites")
});

export type AppConfig = z.infer<typeof envSchema>;

export function getConfig(): AppConfig {
  return envSchema.parse(process.env);
}
