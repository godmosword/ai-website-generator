import { validateSiteSpec } from "@webomate/site-spec";
import type { SiteSpec, SubPage } from "@webomate/site-spec";
import { buildThemeStyles } from "./themes.js";

export interface RenderedPage {
  slug: string;
  html: string;
}

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildSections(sections: SiteSpec["sections"]): string {
  return sections
    .map(
      (section) => `
        <section id="${escapeHtml(section.id)}" class="section-card">
          <h2>${escapeHtml(section.heading)}</h2>
          <p>${escapeHtml(section.body)}</p>
        </section>
      `
    )
    .join("");
}

function buildPageNav(spec: SiteSpec): string {
  if (!spec.pages?.length) return "";
  const links = [
    `<a href="./index.html">${escapeHtml(spec.brandName)}</a>`,
    ...spec.pages.map(
      (p) => `<a href="./${escapeHtml(p.slug)}/index.html">${escapeHtml(p.title)}</a>`
    )
  ].join(" | ");
  return `<nav class="page-nav">${links}</nav>`;
}

function buildHtmlShell(
  seoTitle: string,
  seoDescription: string,
  seoKeywords: string[],
  themeStyles: string,
  bodyContent: string
): string {
  return `<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(seoTitle)}</title>
    <meta name="description" content="${escapeHtml(seoDescription)}" />
    <meta name="keywords" content="${escapeHtml(seoKeywords.join(","))}" />
    <style>${themeStyles}
      .page-nav { padding: 12px 0; margin-bottom: 16px; font-size: 0.9rem; }
      .page-nav a { color: var(--primary); text-decoration: none; margin-right: 8px; }
      .page-nav a:hover { text-decoration: underline; }
    </style>
  </head>
  <body>
    <main class="container">
      ${bodyContent}
    </main>
  </body>
</html>`;
}

export function renderSinglePage(siteSpec: SiteSpec): string {
  const errors = validateSiteSpec(siteSpec);
  if (errors.length > 0) {
    throw new Error(`SiteSpec 驗證失敗: ${errors.join(", ")}`);
  }

  const ctaHtml = siteSpec.ctas
    .map(
      (cta) => `
        <a class="btn btn-${escapeHtml(cta.style)}" href="${escapeHtml(cta.url)}" target="_blank" rel="noopener noreferrer">
          ${escapeHtml(cta.label)}
        </a>
      `
    )
    .join("");

  const linksHtml = siteSpec.links
    .map(
      (link) => `
        <li>
          <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">
            ${escapeHtml(link.label)}
          </a>
        </li>
      `
    )
    .join("");

  const contactRows = [
    siteSpec.contact.address ? `<li>地址：${escapeHtml(siteSpec.contact.address)}</li>` : "",
    siteSpec.contact.phone ? `<li>電話：${escapeHtml(siteSpec.contact.phone)}</li>` : "",
    siteSpec.contact.email ? `<li>Email：${escapeHtml(siteSpec.contact.email)}</li>` : ""
  ].join("");

  const body = `
      ${buildPageNav(siteSpec)}
      <header class="hero">
        <h1>${escapeHtml(siteSpec.hero.title)}</h1>
        <h2>${escapeHtml(siteSpec.hero.subtitle)}</h2>
        <p>${escapeHtml(siteSpec.hero.description)}</p>
      </header>
      <section class="cta-wrap">${ctaHtml}</section>
      <section class="section-grid">${buildSections(siteSpec.sections)}</section>
      <footer class="footer-card">
        <h3>${escapeHtml(siteSpec.brandName)}</h3>
        <ul>${linksHtml}</ul>
        <ul>${contactRows}</ul>
      </footer>`;

  return buildHtmlShell(
    siteSpec.seo.title,
    siteSpec.seo.description,
    siteSpec.seo.keywords,
    buildThemeStyles(siteSpec.theme),
    body
  );
}

export function renderMultiPage(siteSpec: SiteSpec): RenderedPage[] {
  const errors = validateSiteSpec(siteSpec);
  if (errors.length > 0) {
    throw new Error(`SiteSpec 驗證失敗: ${errors.join(", ")}`);
  }

  const themeStyles = buildThemeStyles(siteSpec.theme);
  const pages: RenderedPage[] = [{ slug: "index", html: renderSinglePage(siteSpec) }];

  for (const subPage of siteSpec.pages ?? []) {
    pages.push({ slug: subPage.slug, html: renderSubPage(subPage, siteSpec, themeStyles) });
  }

  return pages;
}

function renderSubPage(subPage: SubPage, root: SiteSpec, themeStyles: string): string {
  const backNav = `<nav class="page-nav"><a href="../index.html">← ${escapeHtml(root.brandName)}</a>${
    root.pages
      ?.filter((p) => p.slug !== subPage.slug)
      .map((p) => ` | <a href="../${escapeHtml(p.slug)}/index.html">${escapeHtml(p.title)}</a>`)
      .join("") ?? ""
  }</nav>`;

  const body = `
      ${backNav}
      <header class="hero">
        <h1>${escapeHtml(subPage.hero.title)}</h1>
        <h2>${escapeHtml(subPage.hero.subtitle)}</h2>
        <p>${escapeHtml(subPage.hero.description)}</p>
      </header>
      <section class="section-grid">${buildSections(subPage.sections)}</section>`;

  return buildHtmlShell(
    subPage.seo.title,
    subPage.seo.description,
    subPage.seo.keywords,
    themeStyles,
    body
  );
}
