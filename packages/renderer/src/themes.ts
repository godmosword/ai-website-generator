import type { SiteTheme } from "@webomate/site-spec";

/**
 * Known Google Fonts families and their URL-encoded names.
 * Falls back to a generic query if not found.
 */
const GOOGLE_FONTS_MAP: Record<string, string> = {
  "Noto Sans TC": "Noto+Sans+TC:wght@400;500;700",
  "Noto Serif TC": "Noto+Serif+TC:wght@400;700",
  Nunito: "Nunito:wght@400;600;700;800",
  Inter: "Inter:wght@400;500;600;700",
  Poppins: "Poppins:wght@400;500;600;700;800",
  Lato: "Lato:wght@400;700",
  Roboto: "Roboto:wght@400;500;700",
  Montserrat: "Montserrat:wght@400;600;700;800",
  "Playfair Display": "Playfair+Display:wght@400;600;700",
  "Source Han Sans": "Noto+Sans+TC:wght@400;700",
  "Source Han Serif": "Noto+Serif+TC:wght@400;700"
};

export function buildGoogleFontsLink(fontFamily: string): string {
  const safeName = fontFamily.replace(/[^a-zA-Z0-9 -]/g, "").trim();
  const encoded = GOOGLE_FONTS_MAP[safeName] ?? encodeURIComponent(safeName) + ":wght@400;700";
  return `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${encoded}&display=swap" rel="stylesheet">`;
}

export function buildThemeStyles(theme: SiteTheme): string {
  const safeFontFamily = theme.fontFamily.replace(/[^a-zA-Z0-9 ,\-_]/g, "");

  const base = `
      :root {
        --primary: ${theme.primaryColor};
        --secondary: ${theme.secondaryColor};
        --font: "${safeFontFamily}", sans-serif;
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body {
        font-family: var(--font);
        line-height: 1.6;
        -webkit-font-smoothing: antialiased;
      }
      a { color: inherit; }
      img { max-width: 100%; display: block; }

      /* ── Layout ── */
      .container { max-width: 1080px; margin: 0 auto; padding: 0 24px; }

      /* ── Navbar ── */
      .site-nav {
        position: sticky; top: 0; z-index: 100;
        display: flex; align-items: center; justify-content: space-between;
        padding: 0 24px; height: 64px;
        backdrop-filter: blur(8px);
      }
      .site-nav__brand {
        display: flex; align-items: center; gap: 10px;
        text-decoration: none; font-weight: 700; font-size: 1.1rem;
      }
      .site-nav__logo { height: 36px; width: auto; border-radius: 4px; object-fit: contain; }
      .site-nav__links {
        display: flex; gap: 24px; list-style: none;
      }
      .site-nav__links a {
        text-decoration: none; font-size: 0.95rem; font-weight: 500;
        opacity: 0.8; transition: opacity 0.2s;
      }
      .site-nav__links a:hover { opacity: 1; }
      .hamburger {
        display: none; flex-direction: column; gap: 5px;
        background: none; border: none; cursor: pointer; padding: 4px;
      }
      .hamburger span {
        display: block; width: 24px; height: 2px; background: currentColor;
        border-radius: 2px; transition: transform 0.25s, opacity 0.25s;
      }
      #nav-toggle { display: none; }
      @media (max-width: 768px) {
        .hamburger { display: flex; }
        .site-nav__links {
          display: none; position: absolute; top: 64px; left: 0; right: 0;
          flex-direction: column; padding: 16px 24px 24px; gap: 16px;
        }
        #nav-toggle:checked ~ .site-nav__links { display: flex; }
        #nav-toggle:checked ~ .hamburger span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        #nav-toggle:checked ~ .hamburger span:nth-child(2) { opacity: 0; }
        #nav-toggle:checked ~ .hamburger span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
      }

      /* ── Hero ── */
      .hero {
        padding: 80px 0 56px;
        position: relative; overflow: hidden;
      }
      .hero__logo {
        height: 72px; width: auto; margin-bottom: 24px;
        border-radius: 8px; object-fit: contain;
      }
      .hero__eyebrow {
        font-size: 0.85rem; font-weight: 600; letter-spacing: 0.1em;
        text-transform: uppercase; margin-bottom: 16px; opacity: 0.7;
      }
      .hero h1 { margin-bottom: 12px; line-height: 1.15; }
      .hero h2 { margin-bottom: 20px; line-height: 1.4; font-weight: 400; }
      .hero p { line-height: 1.8; max-width: 640px; }
      .hero__image {
        margin-top: 40px; border-radius: 16px;
        width: 100%; max-height: 480px; object-fit: cover;
        box-shadow: 0 20px 60px rgba(0,0,0,0.12);
      }

      /* ── CTA Buttons ── */
      .cta-wrap {
        display: flex; gap: 12px; flex-wrap: wrap; margin-top: 32px;
      }
      .btn {
        text-decoration: none; font-weight: 600; font-size: 0.95rem;
        display: inline-flex; align-items: center; gap: 8px;
        border: 2px solid transparent; cursor: pointer;
        transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
        white-space: nowrap;
      }
      .btn:hover { transform: translateY(-2px); }
      .btn:active { transform: translateY(0); }
      .btn-primary {
        background: var(--primary); color: #fff;
        box-shadow: 0 4px 14px rgba(0,0,0,0.15);
      }
      .btn-primary:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
      .btn-secondary {
        background: var(--secondary); color: #1a1a1a;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      }
      .btn-secondary:hover { box-shadow: 0 6px 16px rgba(0,0,0,0.12); }
      .btn-ghost {
        border-color: currentColor; background: transparent;
        opacity: 0.8;
      }
      .btn-ghost:hover { opacity: 1; background: rgba(0,0,0,0.04); }

      /* ── Sections ── */
      .sections-wrap { padding: 32px 0 48px; }
      .section-grid { display: grid; gap: 20px; }

      /* text variant */
      .section-card { }

      /* features variant */
      .section-features { }
      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px; margin-top: 20px;
      }
      .feature-item {
        display: flex; flex-direction: column; gap: 8px;
        padding: 20px; border-radius: 12px;
      }
      .feature-item__icon {
        font-size: 1.8rem; line-height: 1;
      }
      .feature-item__label { font-weight: 600; }
      .feature-item__desc { font-size: 0.9rem; opacity: 0.75; }

      /* stats variant */
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 16px; margin-top: 20px; text-align: center;
      }
      .stat-item { padding: 20px 12px; }
      .stat-item__value {
        font-size: 2.2rem; font-weight: 800; color: var(--primary); line-height: 1.1;
      }
      .stat-item__label { font-size: 0.85rem; opacity: 0.7; margin-top: 6px; }

      /* faq variant */
      .faq-list { margin-top: 20px; display: flex; flex-direction: column; gap: 0; }
      .faq-item { border-bottom: 1px solid rgba(0,0,0,0.08); }
      .faq-item summary {
        font-weight: 600; padding: 16px 0; cursor: pointer;
        display: flex; align-items: center; justify-content: space-between;
        list-style: none; gap: 12px;
      }
      .faq-item summary::-webkit-details-marker { display: none; }
      .faq-item summary::after {
        content: "+"; font-size: 1.4rem; opacity: 0.5; flex-shrink: 0;
        transition: transform 0.25s;
      }
      .faq-item[open] summary::after { transform: rotate(45deg); }
      .faq-item p { padding: 0 0 16px; opacity: 0.8; }

      /* ── Links (social) ── */
      .links-wrap {
        display: flex; flex-wrap: wrap; gap: 12px; margin-top: 16px;
      }
      .link-item {
        display: inline-flex; align-items: center; gap: 8px;
        text-decoration: none; font-size: 0.9rem; font-weight: 500;
        padding: 8px 16px; border-radius: 100px;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
        border: 1px solid rgba(0,0,0,0.1);
      }
      .link-item:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
      .link-item svg { width: 18px; height: 18px; flex-shrink: 0; }

      /* ── Footer ── */
      .footer-card { margin-top: 16px; padding: 40px 0 32px; }
      .footer-card h3 { font-size: 1.1rem; margin-bottom: 20px; }
      .footer-grid { display: grid; gap: 24px; }
      @media (min-width: 640px) { .footer-grid { grid-template-columns: 1fr 1fr; } }
      .contact-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
      .contact-list li { font-size: 0.9rem; opacity: 0.8; }

      /* ── Scroll reveal ── */
      @media (prefers-reduced-motion: no-preference) {
        .reveal {
          opacity: 0; transform: translateY(24px);
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .reveal.visible { opacity: 1; transform: none; }
      }

      /* ── Page nav (multipage) ── */
      .page-nav { display: flex; flex-wrap: wrap; gap: 8px; padding: 12px 0; font-size: 0.9rem; }
      .page-nav a {
        color: var(--primary); text-decoration: none; padding: 4px 10px;
        border-radius: 4px; border: 1px solid var(--primary);
        transition: background 0.15s, color 0.15s;
      }
      .page-nav a:hover { background: var(--primary); color: #fff; }`;

  const toneStyles: Record<SiteTheme["tone"], string> = {
    natural: `
      body { color: #2d3a2e; background: #f4f7f0; }
      .site-nav { background: rgba(244,247,240,0.85); border-bottom: 1px solid #c9dbbf; }
      .site-nav__brand { color: var(--primary); }
      .site-nav__links { background: rgba(244,247,240,0.97); }
      .hero h1 { font-size: clamp(2rem, 5vw, 3rem); color: var(--primary); }
      .hero h2 { font-size: clamp(1rem, 2.5vw, 1.3rem); color: #4b7a54; }
      .btn { border-radius: 100px; padding: 12px 28px; }
      .section-card {
        background: #fff; border: 1px solid #c9dbbf;
        border-radius: 16px; padding: 28px;
      }
      .section-card h2 { margin-bottom: 12px; color: var(--primary); font-size: 1.15rem; }
      .feature-item { background: #f0f5ec; }
      .stat-item { background: #fff; border: 1px solid #c9dbbf; border-radius: 12px; }
      .footer-card { background: #ebf0e7; border-radius: 20px; padding: 40px; }
      .link-item { background: #fff; color: #2d3a2e; }
      @media (max-width: 768px) { .hero h1 { font-size: 1.8rem; } }`,

    minimal: `
      body { color: #111827; background: #ffffff; }
      .site-nav { background: rgba(255,255,255,0.9); border-bottom: 1px solid #f0f0f0; }
      .site-nav__brand { color: #111827; }
      .site-nav__links { background: #fff; border-bottom: 1px solid #f0f0f0; }
      .hero { padding-bottom: 48px; border-bottom: 1px solid #f0f0f0; }
      .hero h1 {
        font-size: clamp(2.2rem, 6vw, 3.8rem); font-weight: 800;
        letter-spacing: -0.03em; color: #111827;
      }
      .hero h2 { font-size: clamp(1rem, 2vw, 1.15rem); font-weight: 400; color: #6b7280; }
      .hero p { color: #4b5563; }
      .btn { border-radius: 6px; padding: 12px 24px; }
      .btn-primary { background: #111827; }
      .section-card {
        border-bottom: 1px solid #e5e7eb; padding: 32px 0; border-radius: 0;
        background: transparent;
      }
      .section-card h2 {
        font-size: 0.8rem; font-weight: 700; text-transform: uppercase;
        letter-spacing: 0.1em; color: #6b7280; margin-bottom: 12px;
      }
      .section-card p { font-size: 1.05rem; }
      .feature-item { border: 1px solid #e5e7eb; border-radius: 8px; }
      .stat-item { border-top: 3px solid var(--primary); }
      .stat-item__value { font-size: 2.6rem; }
      .footer-card { border-top: 2px solid #111827; padding-top: 40px; }
      .footer-card h3 { font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; color: #6b7280; }
      .link-item { background: #f9fafb; color: #111827; }
      @media (max-width: 768px) { .hero h1 { font-size: 2rem; } }`,

    business: `
      body { color: #1f2937; background: #f9fafb; }
      .site-nav { background: rgba(249,250,251,0.9); border-bottom: 1px solid #e5e7eb; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
      .site-nav__brand { color: var(--primary); }
      .site-nav__links { background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
      .hero h1 { font-size: clamp(2rem, 5vw, 3rem); font-weight: 800; color: #111827; }
      .hero h2 { font-size: clamp(1rem, 2vw, 1.2rem); color: #4b5563; }
      .btn { border-radius: 10px; padding: 12px 24px; }
      .section-card {
        background: #fff; border: 1px solid #e5e7eb;
        border-radius: 14px; padding: 28px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      }
      .section-card h2 { color: var(--primary); margin-bottom: 12px; font-size: 1.15rem; }
      .feature-item { background: #f3f4f6; border-radius: 12px; }
      .stat-item { background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
      .footer-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
      .link-item { background: #fff; color: #1f2937; }
      @media (max-width: 768px) { .hero h1 { font-size: 1.8rem; } }`,

    bold: `
      body { color: #ffffff; background: #0a0a0a; }
      .site-nav { background: rgba(10,10,10,0.9); border-bottom: 1px solid rgba(255,255,255,0.08); }
      .site-nav__brand { color: var(--primary); }
      .site-nav__links { background: #0a0a0a; border-bottom: 1px solid rgba(255,255,255,0.08); }
      .hero {
        padding: 100px 0 64px;
        background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
      }
      .hero h1 {
        font-size: clamp(2.5rem, 7vw, 5rem); font-weight: 900;
        letter-spacing: -0.04em; line-height: 1.05;
        background: linear-gradient(120deg, var(--primary), var(--secondary));
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .hero h2 { font-size: clamp(1.1rem, 2.5vw, 1.4rem); color: rgba(255,255,255,0.6); }
      .hero p { color: rgba(255,255,255,0.7); }
      .btn { border-radius: 8px; padding: 14px 32px; font-size: 1rem; }
      .btn-primary {
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        color: #fff; border: none;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      }
      .btn-ghost { border-color: rgba(255,255,255,0.3); color: #fff; }
      .btn-ghost:hover { background: rgba(255,255,255,0.07); }
      .section-card {
        background: #141414; border: 1px solid rgba(255,255,255,0.08);
        border-radius: 16px; padding: 32px;
      }
      .section-card h2 { color: var(--primary); margin-bottom: 12px; }
      .section-card p { color: rgba(255,255,255,0.75); }
      .feature-item { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; }
      .feature-item__desc { color: rgba(255,255,255,0.6); }
      .stat-item { background: #141414; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; }
      .stat-item__label { color: rgba(255,255,255,0.5); }
      .faq-item { border-color: rgba(255,255,255,0.08); }
      .footer-card { background: #141414; border-radius: 20px; padding: 40px; border: 1px solid rgba(255,255,255,0.08); }
      .contact-list li { color: rgba(255,255,255,0.7); }
      .link-item { background: rgba(255,255,255,0.06); color: #fff; border-color: rgba(255,255,255,0.12); }
      @media (max-width: 768px) { .hero h1 { font-size: 2.4rem; } }`,

    elegant: `
      body { color: #2c2c2c; background: #fafaf8; }
      .site-nav { background: rgba(250,250,248,0.92); border-bottom: 1px solid #e8e4dc; }
      .site-nav__brand { color: #2c2c2c; font-family: Georgia, serif; letter-spacing: 0.05em; }
      .site-nav__links { background: #fafaf8; border-bottom: 1px solid #e8e4dc; }
      .site-nav__links a { letter-spacing: 0.05em; font-size: 0.88rem; text-transform: uppercase; }
      .hero { padding: 96px 0 64px; }
      .hero h1 {
        font-size: clamp(2.2rem, 5.5vw, 3.6rem); font-weight: 400;
        font-family: Georgia, "Times New Roman", serif;
        letter-spacing: -0.01em; color: #1a1a1a; line-height: 1.2;
      }
      .hero h2 {
        font-size: clamp(0.95rem, 2vw, 1.1rem); font-weight: 400;
        letter-spacing: 0.08em; text-transform: uppercase;
        color: var(--primary); margin-bottom: 24px;
      }
      .hero p { color: #5a5a5a; font-size: 1.05rem; }
      .btn { border-radius: 0; padding: 14px 36px; font-size: 0.88rem; letter-spacing: 0.1em; text-transform: uppercase; }
      .btn-primary { background: #1a1a1a; color: #fafaf8; }
      .btn-primary:hover { background: #333; }
      .btn-ghost { border-color: #1a1a1a; color: #1a1a1a; }
      .section-card {
        background: #fff; border: 1px solid #e8e4dc;
        padding: 36px; border-radius: 2px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.03);
      }
      .section-card h2 {
        font-size: 0.8rem; letter-spacing: 0.12em; text-transform: uppercase;
        color: var(--primary); margin-bottom: 16px; font-weight: 600;
      }
      .section-card p { font-size: 1rem; line-height: 1.9; color: #444; }
      .feature-item { background: #f5f3ef; border-radius: 4px; }
      .stat-item { border-top: 2px solid var(--primary); padding-top: 24px; }
      .stat-item__value { font-family: Georgia, serif; }
      .footer-card { border-top: 1px solid #e8e4dc; padding-top: 48px; }
      .footer-card h3 { font-family: Georgia, serif; font-weight: 400; font-size: 1.2rem; }
      .link-item { background: #fff; color: #2c2c2c; border-color: #e8e4dc; border-radius: 2px; letter-spacing: 0.05em; font-size: 0.85rem; }
      @media (max-width: 768px) { .hero h1 { font-size: 2rem; } }`
  };

  const darkModeOverride = theme.darkMode
    ? `
      @media (prefers-color-scheme: dark) {
        body { background: #0f0f0f; color: #e5e5e5; }
        .site-nav { background: rgba(15,15,15,0.92); border-color: rgba(255,255,255,0.07); }
        .section-card { background: #1a1a1a; border-color: rgba(255,255,255,0.08); }
        .footer-card { background: #1a1a1a; }
        .link-item { background: #222; color: #e5e5e5; border-color: rgba(255,255,255,0.1); }
        .faq-item { border-color: rgba(255,255,255,0.08); }
        .btn-ghost { border-color: rgba(255,255,255,0.3); color: #e5e5e5; }
      }`
    : "";

  return base + toneStyles[theme.tone] + darkModeOverride;
}
