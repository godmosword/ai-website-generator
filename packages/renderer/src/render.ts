import { validateSiteSpec } from "@webomate/site-spec";
import type { SiteSpec, SubPage, ContentSection } from "@webomate/site-spec";
import { buildThemeStyles, buildGoogleFontsLink } from "./themes.js";

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

// ── SVG Icons ─────────────────────────────────────────────────────────────────

const ICONS: Record<string, string> = {
  facebook: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
  line: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,
  map: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  custom: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`
};

// ── Section builders ───────────────────────────────────────────────────────────

function buildSection(section: ContentSection): string {
  const variant = section.variant ?? "text";

  if (variant === "features" && section.items?.length) {
    const featureItems = section.items
      .map(
        (item) => `
          <div class="feature-item">
            ${item.icon ? `<div class="feature-item__icon">${escapeHtml(item.icon)}</div>` : ""}
            <div class="feature-item__label">${escapeHtml(item.label)}</div>
            ${item.description ? `<div class="feature-item__desc">${escapeHtml(item.description)}</div>` : ""}
          </div>`
      )
      .join("");
    return `
      <section id="${escapeHtml(section.id)}" class="section-card section-features reveal">
        <h2>${escapeHtml(section.heading)}</h2>
        <p>${escapeHtml(section.body)}</p>
        <div class="features-grid">${featureItems}</div>
      </section>`;
  }

  if (variant === "stats" && section.items?.length) {
    const statItems = section.items
      .map(
        (item) => `
          <div class="stat-item">
            <div class="stat-item__value">${escapeHtml(item.value ?? item.label)}</div>
            <div class="stat-item__label">${escapeHtml(item.value ? item.label : (item.description ?? ""))}</div>
          </div>`
      )
      .join("");
    return `
      <section id="${escapeHtml(section.id)}" class="section-card reveal">
        <h2>${escapeHtml(section.heading)}</h2>
        <div class="stats-grid">${statItems}</div>
      </section>`;
  }

  if (variant === "faq" && section.items?.length) {
    const faqItems = section.items
      .map(
        (item) => `
          <details class="faq-item">
            <summary>${escapeHtml(item.label)}</summary>
            <p>${escapeHtml(item.description ?? item.value ?? "")}</p>
          </details>`
      )
      .join("");
    return `
      <section id="${escapeHtml(section.id)}" class="section-card reveal">
        <h2>${escapeHtml(section.heading)}</h2>
        <div class="faq-list">${faqItems}</div>
      </section>`;
  }

  return `
    <section id="${escapeHtml(section.id)}" class="section-card reveal">
      <h2>${escapeHtml(section.heading)}</h2>
      <p>${escapeHtml(section.body)}</p>
    </section>`;
}

function buildSections(sections: ContentSection[]): string {
  return sections.map(buildSection).join("");
}

// ── Navbar ─────────────────────────────────────────────────────────────────────

function buildNavbar(spec: SiteSpec, depth: "" | "../"): string {
  const homeHref = `${depth}index.html`;
  const logoHtml = spec.logoUrl
    ? `<img src="${escapeHtml(spec.logoUrl)}" alt="${escapeHtml(spec.brandName)} logo" class="site-nav__logo">`
    : "";

  const pageLinks = spec.pages?.length
    ? spec.pages
        .map(
          (p) =>
            `<li><a href="${depth}${escapeHtml(p.slug)}/index.html">${escapeHtml(p.title)}</a></li>`
        )
        .join("")
    : "";

  return `<nav class="site-nav" role="navigation" aria-label="主選單">
    <a href="${homeHref}" class="site-nav__brand">
      ${logoHtml}
      ${escapeHtml(spec.brandName)}
    </a>
    <input type="checkbox" id="nav-toggle" aria-hidden="true">
    <label for="nav-toggle" class="hamburger" aria-label="開啟選單">
      <span></span><span></span><span></span>
    </label>
    <ul class="site-nav__links">
      <li><a href="${homeHref}">首頁</a></li>
      ${pageLinks}
    </ul>
  </nav>`;
}

// ── Links ─────────────────────────────────────────────────────────────────────

function buildLinks(links: SiteSpec["links"]): string {
  if (!links.length) return "";
  const items = links
    .map((link) => {
      const iconSvg = link.icon ? (ICONS[link.icon] ?? "") : "";
      return `
        <a class="link-item" href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">
          ${iconSvg}
          ${escapeHtml(link.label)}
        </a>`;
    })
    .join("");
  return `<div class="links-wrap">${items}</div>`;
}

// ── Head (Open Graph, Twitter Card, Schema.org) ───────────────────────────────

function buildHead(opts: {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  ogImageUrl?: string;
  canonicalUrl?: string;
  brandName: string;
  themeStyles: string;
  fontsLink: string;
}): string {
  const ogImage = opts.ogImageUrl
    ? `<meta property="og:image" content="${escapeHtml(opts.ogImageUrl)}">`
    : "";
  const canonical = opts.canonicalUrl
    ? `<link rel="canonical" href="${escapeHtml(opts.canonicalUrl)}">`
    : "";
  const schemaOrg = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: opts.seoTitle,
    description: opts.seoDescription,
    publisher: { "@type": "Organization", name: opts.brandName }
  }).replace(/<\//g, "<\\/");

  return `<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(opts.seoTitle)}</title>
    <meta name="description" content="${escapeHtml(opts.seoDescription)}">
    <meta name="keywords" content="${escapeHtml(opts.seoKeywords.join(","))}">
    ${canonical}
    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="${escapeHtml(opts.seoTitle)}">
    <meta property="og:description" content="${escapeHtml(opts.seoDescription)}">
    ${ogImage}
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(opts.seoTitle)}">
    <meta name="twitter:description" content="${escapeHtml(opts.seoDescription)}">
    ${ogImage.replace("og:image", "twitter:image")}
    <!-- Schema.org -->
    <script type="application/ld+json">${schemaOrg}</script>
    ${opts.fontsLink}
    <style>${opts.themeStyles}</style>
  </head>`;
}

// ── Scroll reveal script ───────────────────────────────────────────────────────

const REVEAL_SCRIPT = `
  <script>
    (function(){
      var obs = new IntersectionObserver(function(entries){
        entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('visible'); obs.unobserve(e.target); } });
      },{threshold:0.12});
      document.querySelectorAll('.reveal').forEach(function(el){ obs.observe(el); });
    })();
  </script>`;

// ── renderSinglePage ───────────────────────────────────────────────────────────

export function renderSinglePage(siteSpec: SiteSpec): string {
  const errors = validateSiteSpec(siteSpec);
  if (errors.length > 0) {
    throw new Error(`SiteSpec 驗證失敗: ${errors.join(", ")}`);
  }

  const themeStyles = buildThemeStyles(siteSpec.theme);
  const fontsLink = buildGoogleFontsLink(siteSpec.theme.fontFamily);

  const ctaHtml = siteSpec.ctas
    .map(
      (cta) =>
        `<a class="btn btn-${escapeHtml(cta.style)}" href="${escapeHtml(cta.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(cta.label)}</a>`
    )
    .join("");

  const contactRows = [
    siteSpec.contact.address ? `<li>📍 ${escapeHtml(siteSpec.contact.address)}</li>` : "",
    siteSpec.contact.phone ? `<li>📞 ${escapeHtml(siteSpec.contact.phone)}</li>` : "",
    siteSpec.contact.email
      ? `<li>✉️ <a href="mailto:${escapeHtml(siteSpec.contact.email)}">${escapeHtml(siteSpec.contact.email)}</a></li>`
      : ""
  ].join("");

  const heroLogoHtml =
    siteSpec.logoUrl && !siteSpec.pages?.length
      ? `<img src="${escapeHtml(siteSpec.logoUrl)}" alt="${escapeHtml(siteSpec.brandName)} logo" class="hero__logo">`
      : "";

  const heroImageHtml = siteSpec.hero.imageUrl
    ? `<img src="${escapeHtml(siteSpec.hero.imageUrl)}" alt="${escapeHtml(siteSpec.hero.title)}" class="hero__image" loading="lazy">`
    : "";

  const head = buildHead({
    seoTitle: siteSpec.seo.title,
    seoDescription: siteSpec.seo.description,
    seoKeywords: siteSpec.seo.keywords,
    ogImageUrl: siteSpec.seo.ogImageUrl,
    canonicalUrl: siteSpec.seo.canonicalUrl,
    brandName: siteSpec.brandName,
    themeStyles,
    fontsLink
  });

  return `${head}
  <body>
    ${buildNavbar(siteSpec, "")}
    <main class="container">
      <header class="hero reveal">
        ${heroLogoHtml}
        <h1>${escapeHtml(siteSpec.hero.title)}</h1>
        <h2>${escapeHtml(siteSpec.hero.subtitle)}</h2>
        <p>${escapeHtml(siteSpec.hero.description)}</p>
        <div class="cta-wrap">${ctaHtml}</div>
        ${heroImageHtml}
      </header>
      <div class="sections-wrap">
        <div class="section-grid">
          ${buildSections(siteSpec.sections)}
        </div>
      </div>
      <footer class="footer-card reveal">
        <h3>${escapeHtml(siteSpec.brandName)}</h3>
        <div class="footer-grid">
          ${buildLinks(siteSpec.links)}
          <ul class="contact-list">${contactRows}</ul>
        </div>
      </footer>
    </main>
    ${REVEAL_SCRIPT}
  </body>
</html>`;
}

// ── renderMultiPage ────────────────────────────────────────────────────────────

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
  const fontsLink = buildGoogleFontsLink(root.theme.fontFamily);

  const heroImageHtml = subPage.hero.imageUrl
    ? `<img src="${escapeHtml(subPage.hero.imageUrl)}" alt="${escapeHtml(subPage.hero.title)}" class="hero__image" loading="lazy">`
    : "";

  const head = buildHead({
    seoTitle: subPage.seo.title,
    seoDescription: subPage.seo.description,
    seoKeywords: subPage.seo.keywords,
    ogImageUrl: subPage.seo.ogImageUrl,
    canonicalUrl: subPage.seo.canonicalUrl,
    brandName: root.brandName,
    themeStyles,
    fontsLink
  });

  return `${head}
  <body>
    ${buildNavbar(root, "../")}
    <main class="container">
      <header class="hero reveal">
        <h1>${escapeHtml(subPage.hero.title)}</h1>
        <h2>${escapeHtml(subPage.hero.subtitle)}</h2>
        <p>${escapeHtml(subPage.hero.description)}</p>
        ${heroImageHtml}
      </header>
      <div class="sections-wrap">
        <div class="section-grid">
          ${buildSections(subPage.sections)}
        </div>
      </div>
    </main>
    ${REVEAL_SCRIPT}
  </body>
</html>`;
}
