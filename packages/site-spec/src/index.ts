import farmBrandFixture from "./fixtures/farm-brand.json" with { type: "json" };
import studioBrandFixture from "./fixtures/studio-brand.json" with { type: "json" };

export type { SiteSpec } from "./types.js";
export { siteSpecJsonSchema, validateSiteSpec } from "./schema.js";

export const fixtures = {
  farmBrand: farmBrandFixture,
  studioBrand: studioBrandFixture
};
