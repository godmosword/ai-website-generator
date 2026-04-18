import { describe, expect, it } from "vitest";
import { fixtures } from "@webomate/site-spec";
import type { SiteSpec } from "@webomate/site-spec";
import { renderSinglePage, renderMultiPage } from "./render.js";

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
    expect(html).toContain("border-radius: 24px");
  });

  it("minimal tone 使用直角樣式", () => {
    const spec: SiteSpec = {
      ...base,
      theme: { ...base.theme, tone: "minimal" }
    };
    const html = renderSinglePage(spec);
    expect(html).toContain("border-radius: 4px");
    expect(html).toContain("letter-spacing");
  });

  it("business tone 使用陰影樣式", () => {
    const spec: SiteSpec = {
      ...base,
      theme: { ...base.theme, tone: "business" }
    };
    const html = renderSinglePage(spec);
    expect(html).toContain("box-shadow");
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
});
