import type { SiteTheme } from "@webomate/site-spec";

export function buildThemeStyles(theme: SiteTheme): string {
  // Strip characters that could break out of a CSS string context
  const safeFontFamily = theme.fontFamily.replace(/[^a-zA-Z0-9 ,\-_]/g, "");
  const base = `
      :root {
        --primary: ${theme.primaryColor};
        --secondary: ${theme.secondaryColor};
        --font: "${safeFontFamily}", sans-serif;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: var(--font);
      }
      .container { max-width: 960px; margin: 0 auto; padding: 24px; }
      .hero { padding: 48px 0 24px; }
      .hero h1 { margin: 0; color: var(--primary); }
      .hero h2 { margin-top: 8px; color: #4b5563; }
      .hero p { line-height: 1.8; }
      .cta-wrap { display: flex; gap: 12px; flex-wrap: wrap; margin: 16px 0 32px; }
      .btn {
        text-decoration: none;
        font-weight: 600;
        border: 1px solid transparent;
        display: inline-block;
      }
      .btn-primary { background: var(--primary); color: #fff; }
      .btn-secondary { background: var(--secondary); color: #111827; }
      .btn-ghost { border-color: #9ca3af; color: #111827; background: #fff; }
      .section-grid { display: grid; gap: 16px; margin-bottom: 32px; }
      ul { margin: 0; padding-left: 20px; }
      li + li { margin-top: 8px; }`;

  const toneStyles: Record<SiteTheme["tone"], string> = {
    natural: `
      body { color: #2d3a2e; background: #f4f7f0; }
      .hero h1 { font-size: 2rem; }
      .hero h2 { font-size: 1.2rem; }
      .btn { border-radius: 24px; padding: 10px 20px; }
      .section-card {
        background: #ffffff;
        border: 1px solid #c9dbbf;
        border-radius: 16px;
        padding: 20px;
      }
      .section-card h2 { margin-top: 0; color: var(--primary); }
      .footer-card {
        background: #f0f5ec;
        border: 1px solid #c9dbbf;
        border-radius: 16px;
        padding: 20px;
      }
      @media (max-width: 768px) { .hero h1 { font-size: 1.6rem; } }`,

    minimal: `
      body { color: #111827; background: #ffffff; }
      .hero h1 { font-size: 2.2rem; font-weight: 700; letter-spacing: -0.02em; }
      .hero h2 { font-size: 1rem; font-weight: 400; color: #6b7280; }
      .btn { border-radius: 4px; padding: 10px 18px; }
      .btn-primary { background: #111827; color: #fff; }
      .section-card {
        background: #fff;
        border-bottom: 1px solid #e5e7eb;
        border-radius: 0;
        padding: 24px 0;
      }
      .section-card h2 { margin-top: 0; font-size: 1rem; text-transform: uppercase;
        letter-spacing: 0.06em; color: #111827; }
      .footer-card {
        border-top: 2px solid #111827;
        padding: 24px 0;
        background: transparent;
      }
      @media (max-width: 768px) { .hero h1 { font-size: 1.8rem; } }`,

    business: `
      body { color: #1f2937; background: #f9fafb; }
      .hero h1 { font-size: 2rem; font-weight: 800; }
      .hero h2 { font-size: 1.15rem; }
      .btn { border-radius: 10px; padding: 10px 16px; }
      .section-card {
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 1px 3px rgba(0,0,0,.06);
      }
      .section-card h2 { margin-top: 0; color: var(--primary); }
      .footer-card {
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 1px 3px rgba(0,0,0,.06);
      }
      @media (max-width: 768px) { .hero h1 { font-size: 1.7rem; } }`
  };

  return base + toneStyles[theme.tone];
}
