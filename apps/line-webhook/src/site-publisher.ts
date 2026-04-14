import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { renderSinglePage } from "@webomate/renderer";
import type { SiteSpec } from "@webomate/site-spec";
import type { AppConfig } from "./config.js";

export async function publishSiteArtifact(config: AppConfig, siteSpec: SiteSpec): Promise<string> {
  if (!/^[a-z0-9-]+$/.test(siteSpec.slug)) {
    throw new Error("invalid slug format");
  }

  const html = renderSinglePage(siteSpec);
  const baseDir = path.resolve(process.cwd(), "sites");
  const outputDir = path.resolve(baseDir, siteSpec.slug);
  if (!outputDir.startsWith(`${baseDir}${path.sep}`)) {
    throw new Error("invalid output path");
  }
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, "index.html"), html, "utf8");

  return `${config.PUBLIC_BASE_URL.replace(/\/$/, "")}/${siteSpec.slug}/`;
}
