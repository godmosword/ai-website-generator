import type { SiteSpec } from "./types.js";

export const siteSpecJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://webomate.dev/schemas/site-spec.json",
  type: "object",
  additionalProperties: false,
  required: [
    "slug",
    "brandName",
    "hero",
    "sections",
    "ctas",
    "links",
    "contact",
    "seo",
    "theme"
  ],
  properties: {
    slug: { type: "string", minLength: 2, pattern: "^[a-z0-9-]+$" },
    brandName: { type: "string", minLength: 1 },
    hero: {
      type: "object",
      additionalProperties: false,
      required: ["title", "subtitle", "description"],
      properties: {
        title: { type: "string", minLength: 1 },
        subtitle: { type: "string", minLength: 1 },
        description: { type: "string", minLength: 1 }
      }
    },
    sections: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "heading", "body"],
        properties: {
          id: { type: "string", minLength: 1 },
          heading: { type: "string", minLength: 1 },
          body: { type: "string", minLength: 1 }
        }
      }
    },
    ctas: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "url", "style"],
        properties: {
          label: { type: "string", minLength: 1 },
          url: { type: "string", pattern: "^https://.+" },
          style: { enum: ["primary", "secondary", "ghost"] }
        }
      }
    },
    links: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "url"],
        properties: {
          label: { type: "string", minLength: 1 },
          url: { type: "string", pattern: "^https://.+" },
          icon: {
            enum: [
              "facebook",
              "instagram",
              "line",
              "linkedin",
              "map",
              "custom"
            ]
          }
        }
      }
    },
    contact: {
      type: "object",
      additionalProperties: false,
      properties: {
        address: { type: "string" },
        phone: { type: "string" },
        email: { type: "string" }
      }
    },
    seo: {
      type: "object",
      additionalProperties: false,
      required: ["title", "description", "keywords"],
      properties: {
        title: { type: "string", minLength: 1 },
        description: { type: "string", minLength: 1 },
        keywords: {
          type: "array",
          minItems: 1,
          items: { type: "string", minLength: 1 }
        }
      }
    },
    theme: {
      type: "object",
      additionalProperties: false,
      required: ["tone", "primaryColor", "secondaryColor", "fontFamily"],
      properties: {
        tone: { enum: ["natural", "minimal", "business"] },
        primaryColor: { type: "string", pattern: "^#([A-Fa-f0-9]{6})$" },
        secondaryColor: { type: "string", pattern: "^#([A-Fa-f0-9]{6})$" },
        fontFamily: { type: "string", minLength: 1 }
      }
    }
  }
} as const;

const HTTPS_URL = /^https:\/\/.+/;
const HEX_COLOR = /^#([A-Fa-f0-9]{6})$/;
const SLUG = /^[a-z0-9-]+$/;

export function validateSiteSpec(siteSpec: SiteSpec): string[] {
  const errors: string[] = [];

  if (!SLUG.test(siteSpec.slug)) {
    errors.push("slug 必須為小寫英數與連字號");
  }

  if (!siteSpec.sections.length) {
    errors.push("sections 至少需要 1 筆");
  }

  if (!siteSpec.ctas.length) {
    errors.push("ctas 至少需要 1 筆");
  }

  for (const cta of siteSpec.ctas) {
    if (!HTTPS_URL.test(cta.url)) {
      errors.push(`cta url 非 https: ${cta.url}`);
    }
  }

  for (const link of siteSpec.links) {
    if (!HTTPS_URL.test(link.url)) {
      errors.push(`link url 非 https: ${link.url}`);
    }
  }

  if (!HEX_COLOR.test(siteSpec.theme.primaryColor)) {
    errors.push("theme.primaryColor 必須為 #RRGGBB");
  }

  if (!HEX_COLOR.test(siteSpec.theme.secondaryColor)) {
    errors.push("theme.secondaryColor 必須為 #RRGGBB");
  }

  if (!siteSpec.seo.keywords.length) {
    errors.push("seo.keywords 至少需要 1 筆");
  }

  return errors;
}
