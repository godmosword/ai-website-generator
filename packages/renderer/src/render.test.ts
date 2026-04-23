import { describe, expect, it } from "vitest";
import { fixtures } from "@webomate/site-spec";
import type { SiteSpec } from "@webomate/site-spec";
import { renderSinglePage, renderMultiPage } from "./render.js";
import { buildThemeStyles } from "./themes.js";

const base = fixtures.studioBrand as SiteSpec;

describe("renderSinglePage", () => {
  it("能渲染基本 HTML 結構", () => {
    const html = renderSinglePage(fixtures.farmBrand as SiteSpec);

    expect(html).toContain("<!doctype html>");
    expect(html).toContain("高雄山泉小農");
    expect(html).toContain("立即下單");
    expect(html).toContain("客服諮詢");
    expect(html).toContain("maps.google.com");
  });

  it("會擋下不合法的 schema 欄位", () => {
    const badSpec: SiteSpec = {
      ...base,
      ctas: [{ label: "test", url: "http://unsafe.com", style: "primary" }]
    };

    expect(() => renderSinglePage(badSpec)).toThrow("SiteSpec 驗證失敗");
  });

  it("會跳脫危險字元避免直接注入", () => {
    const xssSpec: SiteSpec = {
      ...base,
      hero: {
        title: "<script>alert('x')</script>",
        subtitle: "ok",
        description: "safe"
      }
    };

    const html = renderSinglePage(xssSpec);
    expect(html).not.toContain("<script>alert('x')</script>");
    expect(html).toContain("&lt;script&gt;alert");
  });

  it("跳脫雙引號防止 attribute injection", () => {
    const spec: SiteSpec = {
      ...base,
      seo: { ...base.seo, description: 'desc" onload="evil()' }
    };
    const html = renderSinglePage(spec);
    expect(html).not.toContain('"onload="');
    expect(html).toContain("&quot; onload=&quot;");
  });

  it("跳脫單引號防止 attribute injection", () => {
    const spec: SiteSpec = {
      ...base,
      hero: { ...base.hero, title: "it's a test" }
    };
    const html = renderSinglePage(spec);
    expect(html).toContain("it&#039;s a test");
  });

  it("極長文案仍能正常輸出不截斷", () => {
    const longText = "あ".repeat(5000);
    const spec: SiteSpec = {
      ...base,
      sections: [{ id: "long", heading: "標題", body: longText }]
    };
    const html = renderSinglePage(spec);
    expect(html).toContain(longText);
  });

  it("contact 全部欄位為空時仍渲染正常 HTML", () => {
    const spec: SiteSpec = { ...base, contact: {} };
    const html = renderSinglePage(spec);
    expect(html).toContain("<!doctype html>");
    expect(html).not.toContain("地址：");
    expect(html).not.toContain("電話：");
    expect(html).not.toContain("Email：");
  });

  it("links 為空陣列時仍渲染正常 HTML", () => {
    const spec: SiteSpec = { ...base, links: [] };
    const html = renderSinglePage(spec);
    expect(html).toContain("<!doctype html>");
  });

  it("多個 sections 全部出現在輸出中", () => {
    const spec: SiteSpec = {
      ...base,
      sections: [
        { id: "s1", heading: "章節甲", body: "內容甲" },
        { id: "s2", heading: "章節乙", body: "內容乙" },
        { id: "s3", heading: "章節丙", body: "內容丙" }
      ]
    };
    const html = renderSinglePage(spec);
    expect(html).toContain("章節甲");
    expect(html).toContain("章節乙");
    expect(html).toContain("章節丙");
  });

  it("& 符號在標題中正確跳脫", () => {
    const spec: SiteSpec = {
      ...base,
      hero: { ...base.hero, title: "A & B" }
    };
    const html = renderSinglePage(spec);
    expect(html).not.toContain("A & B");
    expect(html).toContain("A &amp; B");
  });

  it("ghost style CTA 使用正確 class", () => {
    const spec: SiteSpec = {
      ...base,
      ctas: [{ label: "試試看", url: "https://example.com", style: "ghost" }]
    };
    const html = renderSinglePage(spec);
    expect(html).toContain('class="btn btn-ghost"');
  });

  it("SEO keywords 以逗號連接輸出到 meta", () => {
    const spec: SiteSpec = {
      ...base,
      seo: { ...base.seo, keywords: ["設計", "品牌", "台灣"] }
    };
    const html = renderSinglePage(spec);
    expect(html).toContain('content="設計,品牌,台灣"');
  });

  it("natural tone 使用圓角樣式", () => {
    const spec: SiteSpec = {
      ...base,
      theme: { ...base.theme, tone: "natural" }
    };
    const html = renderSinglePage(spec);
    expect(html).toContain("border-radius");
    expect(html).toContain("#f4f7f0");
  });

  it("minimal tone 使用直角樣式", () => {
    const spec: SiteSpec = {
      ...base,
      theme: { ...base.theme, tone: "minimal" }
    };
    const html = renderSinglePage(spec);
    expect(html).toContain("letter-spacing");
    expect(html).toContain("font-weight: 800");
  });

  it("business tone 使用陰影樣式", () => {
    const spec: SiteSpec = {
      ...base,
      theme: { ...base.theme, tone: "business" }
    };
    const html = renderSinglePage(spec);
    expect(html).toContain("box-shadow");
  });

  it("bold tone 包含漸層樣式", () => {
    const spec: SiteSpec = {
      ...base,
      theme: { ...base.theme, tone: "bold" }
    };
    const html = renderSinglePage(spec);
    expect(html).toContain("gradient");
  });

  it("elegant tone 包含 serif 字型設定", () => {
    const spec: SiteSpec = {
      ...base,
      theme: { ...base.theme, tone: "elegant" }
    };
    const html = renderSinglePage(spec);
    expect(html).toContain("Georgia");
  });

  it("darkMode: true 時包含 prefers-color-scheme", () => {
    const spec: SiteSpec = {
      ...base,
      theme: { ...base.theme, darkMode: true }
    };
    const html = renderSinglePage(spec);
    expect(html).toContain("prefers-color-scheme");
  });

  it("hero.imageUrl 有值時輸出 img 標籤", () => {
    const spec: SiteSpec = {
      ...base,
      hero: { ...base.hero, imageUrl: "https://example.com/hero.jpg" }
    };
    const html = renderSinglePage(spec);
    expect(html).toContain("hero.jpg");
    expect(html).toContain("hero__image");
  });

  it("logoUrl 有值時輸出 img 標籤", () => {
    const spec: SiteSpec = {
      ...base,
      logoUrl: "https://example.com/logo.png"
    };
    const html = renderSinglePage(spec);
    expect(html).toContain("logo.png");
  });

  it("社群 icon 連結渲染 SVG", () => {
    const spec: SiteSpec = {
      ...base,
      links: [
        { label: "Facebook", url: "https://facebook.com/test", icon: "facebook" },
        { label: "Instagram", url: "https://instagram.com/test", icon: "instagram" }
      ]
    };
    const html = renderSinglePage(spec);
    expect(html).toContain("facebook.com/test");
    expect(html).toContain("instagram.com/test");
    expect(html).toContain("<svg");
  });

  it("features variant 輸出 features-grid", () => {
    const spec: SiteSpec = {
      ...base,
      sections: [
        {
          id: "feat",
          heading: "特色",
          body: "說明",
          variant: "features",
          items: [
            { label: "快速", description: "閃電般快速", icon: "⚡" },
            { label: "安全", description: "銀行級加密", icon: "🔒" }
          ]
        }
      ]
    };
    const html = renderSinglePage(spec);
    expect(html).toContain("features-grid");
    expect(html).toContain("快速");
    expect(html).toContain("閃電般快速");
    expect(html).toContain("⚡");
  });

  it("stats variant 輸出 stats-grid", () => {
    const spec: SiteSpec = {
      ...base,
      sections: [
        {
          id: "stats",
          heading: "數據",
          body: "成果",
          variant: "stats",
          items: [
            { label: "客戶數", value: "1,000+" },
            { label: "滿意度", value: "98%" }
          ]
        }
      ]
    };
    const html = renderSinglePage(spec);
    expect(html).toContain("stats-grid");
    expect(html).toContain("1,000+");
    expect(html).toContain("98%");
  });

  it("faq variant 輸出 details/summary 折疊區塊", () => {
    const spec: SiteSpec = {
      ...base,
      sections: [
        {
          id: "faq",
          heading: "常見問題",
          body: "解答",
          variant: "faq",
          items: [
            { label: "如何下單？", description: "透過官網購物車即可。" },
            { label: "可以退貨嗎？", description: "七天鑑賞期。" }
          ]
        }
      ]
    };
    const html = renderSinglePage(spec);
    expect(html).toContain("<details");
    expect(html).toContain("<summary>");
    expect(html).toContain("如何下單？");
    expect(html).toContain("透過官網購物車即可。");
  });

  it("輸出 Open Graph meta 標籤", () => {
    const spec: SiteSpec = { ...base };
    const html = renderSinglePage(spec);
    expect(html).toContain('property="og:title"');
    expect(html).toContain('property="og:description"');
  });

  it("輸出 Twitter Card meta 標籤", () => {
    const spec: SiteSpec = { ...base };
    const html = renderSinglePage(spec);
    expect(html).toContain('name="twitter:card"');
  });

  it("輸出 Schema.org JSON-LD", () => {
    const spec: SiteSpec = { ...base };
    const html = renderSinglePage(spec);
    expect(html).toContain("application/ld+json");
    expect(html).toContain("schema.org");
  });

  it("輸出 Google Fonts link 標籤", () => {
    const spec: SiteSpec = { ...base };
    const html = renderSinglePage(spec);
    expect(html).toContain("fonts.googleapis.com");
    expect(html).toContain("preconnect");
  });

  it("seo.ogImageUrl 有值時加入 og:image", () => {
    const spec: SiteSpec = {
      ...base,
      seo: { ...base.seo, ogImageUrl: "https://example.com/og.jpg" }
    };
    const html = renderSinglePage(spec);
    expect(html).toContain("og.jpg");
    expect(html).toContain('property="og:image"');
  });

  it("包含漢堡選單 Navbar", () => {
    const spec: SiteSpec = { ...base };
    const html = renderSinglePage(spec);
    expect(html).toContain("site-nav");
    expect(html).toContain("hamburger");
  });
});

describe("renderMultiPage", () => {
  it("無 pages 時只輸出 index", () => {
    const pages = renderMultiPage(base);
    expect(pages).toHaveLength(1);
    expect(pages[0].slug).toBe("index");
  });

  it("有 pages 時輸出 index + 子頁", () => {
    const spec: SiteSpec = {
      ...base,
      pages: [
        {
          slug: "about",
          title: "關於我們",
          hero: { title: "About", subtitle: "sub", description: "desc" },
          sections: [{ id: "s1", heading: "標題", body: "內容" }],
          seo: { title: "About", description: "about page", keywords: ["about"] }
        }
      ]
    };
    const pages = renderMultiPage(spec);
    expect(pages).toHaveLength(2);
    expect(pages.map((p) => p.slug)).toEqual(["index", "about"]);
  });

  it("子頁 HTML 包含返回首頁連結", () => {
    const spec: SiteSpec = {
      ...base,
      pages: [
        {
          slug: "services",
          title: "服務",
          hero: { title: "服務", subtitle: "sub", description: "desc" },
          sections: [{ id: "s1", heading: "標題", body: "內容" }],
          seo: { title: "服務", description: "services", keywords: ["svc"] }
        }
      ]
    };
    const pages = renderMultiPage(spec);
    const subPage = pages.find((p) => p.slug === "services")!;
    expect(subPage.html).toContain("../index.html");
  });

  it("首頁包含子頁導覽連結", () => {
    const spec: SiteSpec = {
      ...base,
      pages: [
        {
          slug: "contact",
          title: "聯絡我們",
          hero: { title: "Contact", subtitle: "sub", description: "desc" },
          sections: [{ id: "s1", heading: "標題", body: "內容" }],
          seo: { title: "Contact", description: "contact", keywords: ["contact"] }
        }
      ]
    };
    const pages = renderMultiPage(spec);
    const index = pages.find((p) => p.slug === "index")!;
    expect(index.html).toContain("contact/index.html");
    expect(index.html).toContain("聯絡我們");
  });

  it("多頁時各頁都正確跳脫 XSS", () => {
    const spec: SiteSpec = {
      ...base,
      pages: [
        {
          slug: "xss-page",
          title: "<script>evil()</script>",
          hero: { title: "safe", subtitle: "safe", description: "safe" },
          sections: [{ id: "s1", heading: "標題", body: "內容" }],
          seo: { title: "safe", description: "safe", keywords: ["k"] }
        }
      ]
    };
    const pages = renderMultiPage(spec);
    const index = pages.find((p) => p.slug === "index")!;
    expect(index.html).not.toContain("<script>evil()");
    expect(index.html).toContain("&lt;script&gt;");
  });

  it("無效 spec 時 renderMultiPage 拋出錯誤", () => {
    const badSpec = {
      ...base,
      ctas: [{ label: "x", url: "http://not-https.com", style: "primary" as const }]
    };
    expect(() => renderMultiPage(badSpec)).toThrow("SiteSpec 驗證失敗");
  });

  it("多個子頁時子頁包含兄弟頁面導覽連結", () => {
    const spec: SiteSpec = {
      ...base,
      pages: [
        {
          slug: "about",
          title: "關於我們",
          hero: { title: "About", subtitle: "s", description: "d" },
          sections: [{ id: "s1", heading: "h", body: "b" }],
          seo: { title: "About", description: "about", keywords: ["about"] }
        },
        {
          slug: "services",
          title: "服務項目",
          hero: { title: "Services", subtitle: "s", description: "d" },
          sections: [{ id: "s2", heading: "h", body: "b" }],
          seo: { title: "Services", description: "services", keywords: ["svc"] }
        }
      ]
    };
    const pages = renderMultiPage(spec);
    const aboutPage = pages.find((p) => p.slug === "about")!;
    expect(aboutPage.html).toContain("../services/index.html");
    expect(aboutPage.html).toContain("服務項目");
  });
});

describe("buildThemeStyles", () => {
  const baseTheme = (fixtures.studioBrand as SiteSpec).theme;

  it("natural tone 含有綠色背景", () => {
    const css = buildThemeStyles({ ...baseTheme, tone: "natural" });
    expect(css).toContain("#f4f7f0");
    expect(css).toContain("border-radius");
  });

  it("minimal tone 含有 letter-spacing", () => {
    const css = buildThemeStyles({ ...baseTheme, tone: "minimal" });
    expect(css).toContain("letter-spacing");
    expect(css).toContain("font-weight: 800");
  });

  it("business tone 含有陰影", () => {
    const css = buildThemeStyles({ ...baseTheme, tone: "business" });
    expect(css).toContain("box-shadow");
  });

  it("bold tone 含有 gradient", () => {
    const css = buildThemeStyles({ ...baseTheme, tone: "bold" });
    expect(css).toContain("gradient");
  });

  it("elegant tone 含有 Georgia serif", () => {
    const css = buildThemeStyles({ ...baseTheme, tone: "elegant" });
    expect(css).toContain("Georgia");
  });

  it("CSS 中包含 primaryColor 與 secondaryColor CSS 變數", () => {
    const css = buildThemeStyles({ ...baseTheme, tone: "business" });
    expect(css).toContain(`--primary: ${baseTheme.primaryColor}`);
    expect(css).toContain(`--secondary: ${baseTheme.secondaryColor}`);
  });

  it("CSS 中包含 fontFamily", () => {
    const css = buildThemeStyles({ ...baseTheme, tone: "minimal" });
    expect(css).toContain(baseTheme.fontFamily);
  });

  it("darkMode: true 時包含 prefers-color-scheme", () => {
    const css = buildThemeStyles({ ...baseTheme, tone: "minimal", darkMode: true });
    expect(css).toContain("prefers-color-scheme");
  });

  it("darkMode: false 時不含 prefers-color-scheme", () => {
    const css = buildThemeStyles({ ...baseTheme, tone: "minimal", darkMode: false });
    expect(css).not.toContain("prefers-color-scheme");
  });
});
