#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { validateSiteSpec, siteSpecJsonSchema } from "@webomate/site-spec";
import type { SiteSpec } from "@webomate/site-spec";
import { renderSinglePage } from "@webomate/renderer";

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
    default:
      printHelp();
      process.exit(command ? 1 : 0);
  }
}

function printHelp() {
  process.stdout.write(
    `webomate <command> [options]

Commands:
  init <slug>           新建 sites/<slug>/site-spec.json 範本
  validate <spec-file>  驗證 site-spec.json 格式
  build <spec-file>     將 site-spec.json 轉成 index.html（輸出至同目錄）
  preview <spec-file>   啟動本機預覽伺服器（預設 port 3000）
`
  );
}

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
    sections: [{ id: "about", heading: "關於我們", body: "填入段落內容。" }],
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
      fontFamily: "Noto Sans TC"
    }
  };

  await writeFile(dest, JSON.stringify(template, null, 2) + "\n", "utf8");
  process.stdout.write(`已建立 ${dest}\n`);
}

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

async function cmdBuild(specPath: string | undefined) {
  const resolved = resolveSpecPath(specPath);
  const spec = await loadSpec(resolved);
  const html = renderSinglePage(spec);
  const outPath = path.join(path.dirname(resolved), "index.html");
  await writeFile(outPath, html, "utf8");
  process.stdout.write(`✓ 已輸出 ${outPath}\n`);
}

async function cmdPreview(specPath: string | undefined) {
  const resolved = resolveSpecPath(specPath);
  const port = Number(process.env["PORT"] ?? 3000);

  const server = createServer(async (_req, res) => {
    try {
      const spec = await loadSpec(resolved);
      const html = renderSinglePage(spec);
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(err instanceof Error ? err.message : String(err));
    }
  });

  server.listen(port, () => {
    process.stdout.write(`預覽伺服器啟動：http://localhost:${port}\n`);
    process.stdout.write(`監聽 ${resolved}（每次重新整理即重新讀取）\n`);
    process.stdout.write(`Ctrl+C 停止\n`);
  });
}

function resolveSpecPath(p: string | undefined): string {
  if (!p) {
    process.stderr.write("錯誤：請提供 site-spec.json 路徑\n");
    printHelp();
    process.exit(1);
  }
  return path.resolve(p);
}

async function loadSpec(specPath: string): Promise<SiteSpec> {
  let raw: string;
  try {
    raw = await readFile(specPath, "utf8");
  } catch {
    process.stderr.write(`錯誤：找不到檔案 ${specPath}\n`);
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
