import { describe, expect, it } from "vitest";
import { fixtures, validateSiteSpec } from "./index.js";
import type { SiteSpec } from "./types.js";

describe("validateSiteSpec", () => {
  it("通過合法 fixture", () => {
    expect(validateSiteSpec(fixtures.farmBrand as SiteSpec)).toEqual([]);
    expect(validateSiteSpec(fixtures.studioBrand as SiteSpec)).toEqual([]);
  });

  it("拒絕非法 slug", () => {
    const spec = { ...(fixtures.studioBrand as SiteSpec), slug: "Bad_Slug" };
    expect(validateSiteSpec(spec)).toContain("slug 必須為小寫英數與連字號");
  });

  it("拒絕非 https 的 CTA", () => {
    const spec: SiteSpec = {
      ...(fixtures.studioBrand as SiteSpec),
      ctas: [{ label: "x", url: "http://evil.com", style: "primary" }]
    };
    expect(validateSiteSpec(spec).some((e) => e.includes("cta url 非 https"))).toBe(true);
  });

  it("拒絕非 https 的連結", () => {
    const spec: SiteSpec = {
      ...(fixtures.studioBrand as SiteSpec),
      links: [{ label: "x", url: "ftp://x" }]
    };
    expect(validateSiteSpec(spec).some((e) => e.includes("link url 非 https"))).toBe(true);
  });

  it("拒絕錯誤色碼", () => {
    const base = fixtures.studioBrand as SiteSpec;
    const spec: SiteSpec = {
      ...base,
      theme: { ...base.theme, primaryColor: "#GGGGGG" }
    };
    expect(validateSiteSpec(spec)).toContain("theme.primaryColor 必須為 #RRGGBB");
  });

  it("拒絕 secondaryColor 色碼錯誤", () => {
    const base = fixtures.studioBrand as SiteSpec;
    const spec: SiteSpec = {
      ...base,
      theme: { ...base.theme, secondaryColor: "blue" }
    };
    expect(validateSiteSpec(spec)).toContain("theme.secondaryColor 必須為 #RRGGBB");
  });

  it("拒絕 sections 空陣列", () => {
    const spec: SiteSpec = { ...(fixtures.studioBrand as SiteSpec), sections: [] };
    expect(validateSiteSpec(spec)).toContain("sections 至少需要 1 筆");
  });

  it("拒絕 ctas 空陣列", () => {
    const spec: SiteSpec = { ...(fixtures.studioBrand as SiteSpec), ctas: [] };
    expect(validateSiteSpec(spec)).toContain("ctas 至少需要 1 筆");
  });

  it("拒絕 seo.keywords 空陣列", () => {
    const base = fixtures.studioBrand as SiteSpec;
    const spec: SiteSpec = {
      ...base,
      seo: { ...base.seo, keywords: [] }
    };
    expect(validateSiteSpec(spec)).toContain("seo.keywords 至少需要 1 筆");
  });

  it("拒絕非法 tone", () => {
    const base = fixtures.studioBrand as SiteSpec;
    const spec = {
      ...base,
      theme: { ...base.theme, tone: "trendy" }
    } as unknown as SiteSpec;
    expect(validateSiteSpec(spec).some((e) => e.includes("值不合法"))).toBe(true);
  });

  it("拒絕 additionalProperties 多餘欄位", () => {
    const spec = {
      ...(fixtures.studioBrand as SiteSpec),
      extraField: "should-fail"
    } as unknown as SiteSpec;
    expect(validateSiteSpec(spec).some((e) => e.includes("含有未知欄位"))).toBe(true);
  });

  it("拒絕 links icon 不合法值", () => {
    const base = fixtures.studioBrand as SiteSpec;
    const spec = {
      ...base,
      links: [{ label: "x", url: "https://example.com", icon: "twitter" }]
    } as unknown as SiteSpec;
    expect(validateSiteSpec(spec).some((e) => e.includes("值不合法"))).toBe(true);
  });

  it("拒絕 ctas style 不合法值", () => {
    const base = fixtures.studioBrand as SiteSpec;
    const spec = {
      ...base,
      ctas: [{ label: "x", url: "https://example.com", style: "danger" }]
    } as unknown as SiteSpec;
    expect(validateSiteSpec(spec).some((e) => e.includes("值不合法"))).toBe(true);
  });

  it("拒絕 brandName 空字串", () => {
    const spec: SiteSpec = { ...(fixtures.studioBrand as SiteSpec), brandName: "" };
    expect(validateSiteSpec(spec).some((e) => e.includes("不可為空字串"))).toBe(true);
  });

  it("拒絕缺少必要欄位", () => {
    const { slug: _slug, ...noSlug } = fixtures.studioBrand as SiteSpec;
    const spec = noSlug as unknown as SiteSpec;
    expect(validateSiteSpec(spec).some((e) => e.includes("缺少必要欄位"))).toBe(true);
  });

  it("拒絕 pages 子頁非法 slug", () => {
    const base = fixtures.studioBrand as SiteSpec;
    const spec: SiteSpec = {
      ...base,
      pages: [
        {
          slug: "Bad Slug",
          title: "test",
          hero: { title: "t", subtitle: "s", description: "d" },
          sections: [{ id: "s1", heading: "h", body: "b" }],
          seo: { title: "t", description: "d", keywords: ["k"] }
        }
      ]
    };
    expect(validateSiteSpec(spec).some((e) => e.includes("驗證錯誤") || e.includes("值不合法") || e.includes("不可為空字串") || e.length > 0)).toBe(true);
    expect(validateSiteSpec(spec)).not.toHaveLength(0);
  });
});
