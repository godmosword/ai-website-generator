import { validateSiteSpec } from "@webomate/site-spec";
import type { SiteSpec } from "@webomate/site-spec";

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderSinglePage(siteSpec: SiteSpec): string {
  const errors = validateSiteSpec(siteSpec);
  if (errors.length > 0) {
    throw new Error(`SiteSpec 驗證失敗: ${errors.join(", ")}`);
  }

  const sectionHtml = siteSpec.sections
    .map(
      (section) => `
        <section id="${escapeHtml(section.id)}" class="section-card">
          <h2>${escapeHtml(section.heading)}</h2>
          <p>${escapeHtml(section.body)}</p>
        </section>
      `
    )
    .join("");

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

  return `<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(siteSpec.seo.title)}</title>
    <meta name="description" content="${escapeHtml(siteSpec.seo.description)}" />
    <meta name="keywords" content="${escapeHtml(siteSpec.seo.keywords.join(","))}" />
    <style>
      :root {
        --primary: ${siteSpec.theme.primaryColor};
        --secondary: ${siteSpec.theme.secondaryColor};
        --font: "${escapeHtml(siteSpec.theme.fontFamily)}", sans-serif;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: var(--font);
        color: #1f2937;
        background: #f9fafb;
      }
      .container { max-width: 960px; margin: 0 auto; padding: 24px; }
      .hero { padding: 48px 0 24px; }
      .hero h1 { margin: 0; font-size: 2rem; color: var(--primary); }
      .hero h2 { margin-top: 8px; font-size: 1.2rem; color: #4b5563; }
      .hero p { line-height: 1.8; }
      .cta-wrap { display: flex; gap: 12px; flex-wrap: wrap; margin: 16px 0 32px; }
      .btn {
        text-decoration: none;
        border-radius: 10px;
        padding: 10px 16px;
        font-weight: 600;
        border: 1px solid transparent;
      }
      .btn-primary { background: var(--primary); color: #fff; }
      .btn-secondary { background: var(--secondary); color: #111827; }
      .btn-ghost { border-color: #9ca3af; color: #111827; background: #fff; }
      .section-grid { display: grid; gap: 16px; margin-bottom: 32px; }
      .section-card {
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 20px;
      }
      .section-card h2 { margin-top: 0; color: var(--primary); }
      .footer-card {
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 20px;
      }
      ul { margin: 0; padding-left: 20px; }
      li + li { margin-top: 8px; }
      @media (max-width: 768px) {
        .hero h1 { font-size: 1.7rem; }
      }
    </style>
  </head>
  <body>
    <main class="container">
      <header class="hero">
        <h1>${escapeHtml(siteSpec.hero.title)}</h1>
        <h2>${escapeHtml(siteSpec.hero.subtitle)}</h2>
        <p>${escapeHtml(siteSpec.hero.description)}</p>
      </header>
      <section class="cta-wrap">${ctaHtml}</section>
      <section class="section-grid">${sectionHtml}</section>
      <footer class="footer-card">
        <h3>${escapeHtml(siteSpec.brandName)}</h3>
        <ul>${linksHtml}</ul>
        <ul>${contactRows}</ul>
      </footer>
    </main>
  </body>
</html>`;
}
