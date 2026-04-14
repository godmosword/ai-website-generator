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
});
