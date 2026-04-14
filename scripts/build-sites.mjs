import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const sitesRoot = path.join(root, "sites");

const siteSlugFilter = process.env.SITE_SLUG?.trim();

async function loadRenderer() {
  const rendererEntry = path.join(root, "packages", "renderer", "dist", "index.js");
  return import(pathToFileURL(rendererEntry).href);
}

async function buildSiteFolder(slug, renderSinglePage) {
  const dir = path.join(sitesRoot, slug);
  const specPath = path.join(dir, "site-spec.json");
  let raw;
  try {
    raw = await readFile(specPath, "utf8");
  } catch {
    return { slug, status: "skipped", reason: "no site-spec.json" };
  }

  let siteSpec;
  try {
    siteSpec = JSON.parse(raw);
  } catch (error) {
    return { slug, status: "error", reason: `invalid json: ${error}` };
  }

  try {
    const html = renderSinglePage(siteSpec);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, "index.html"), html, "utf8");
    return { slug, status: "built" };
  } catch (error) {
    return {
      slug,
      status: "error",
      reason: error instanceof Error ? error.message : String(error)
    };
  }
}

async function main() {
  const { renderSinglePage } = await loadRenderer();

  const entries = await readdir(sitesRoot, { withFileTypes: true });
  const slugs = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((name) => !name.startsWith("."))
    .filter((name) => (siteSlugFilter ? name === siteSlugFilter : true));

  const results = [];
  for (const slug of slugs) {
    results.push(await buildSiteFolder(slug, renderSinglePage));
  }

  const errors = results.filter((r) => r.status === "error");
  if (errors.length > 0) {
    console.error(JSON.stringify(errors, null, 2));
    process.exitCode = 1;
    return;
  }

  if (siteSlugFilter) {
    const match = results.find((r) => r.slug === siteSlugFilter);
    if (!match || match.status !== "built") {
      console.error(
        JSON.stringify(
          {
            slug: siteSlugFilter,
            reason: "SITE_SLUG 未對應到已建置的資料夾（需存在 sites/<slug>/site-spec.json）",
            results
          },
          null,
          2
        )
      );
      process.exitCode = 1;
      return;
    }
  }

  console.log(JSON.stringify(results, null, 2));
}

await main();
