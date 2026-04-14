import { describe, expect, it } from "vitest";
import { fixtures } from "@webomate/site-spec";
import type { SiteSpec } from "@webomate/site-spec";
import { renderSinglePage } from "./render.js";

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
      ...(fixtures.studioBrand as SiteSpec),
      ctas: [{ label: "test", url: "http://unsafe.com", style: "primary" }]
    };

    expect(() => renderSinglePage(badSpec)).toThrow("SiteSpec 驗證失敗");
  });

  it("會跳脫危險字元避免直接注入", () => {
    const xssSpec: SiteSpec = {
      ...(fixtures.studioBrand as SiteSpec),
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
});
