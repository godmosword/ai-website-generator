import { Ajv2020, type ErrorObject } from "ajv/dist/2020.js";
import type { SiteSpec } from "./types.js";

const heroSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "subtitle", "description"],
  properties: {
    title: { type: "string", minLength: 1 },
    subtitle: { type: "string", minLength: 1 },
    description: { type: "string", minLength: 1 },
    imageUrl: { type: "string", pattern: "^https://.+" }
  }
} as const;

const sectionItemSchema = {
  type: "object",
  additionalProperties: false,
  required: ["label"],
  properties: {
    label: { type: "string", minLength: 1 },
    value: { type: "string" },
    description: { type: "string" },
    icon: { type: "string" }
  }
} as const;

const contentSectionSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "heading", "body"],
  properties: {
    id: { type: "string", minLength: 1 },
    heading: { type: "string", minLength: 1 },
    body: { type: "string", minLength: 1 },
    variant: { enum: ["text", "features", "faq", "stats"] },
    items: { type: "array", items: sectionItemSchema }
  }
} as const;

const seoSchema = {
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
    },
    ogImageUrl: { type: "string", pattern: "^https://.+" },
    canonicalUrl: { type: "string", pattern: "^https://.+" }
  }
} as const;

export const siteSpecJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://webomate.dev/schemas/site-spec.json",
  type: "object",
  additionalProperties: false,
  required: ["slug", "brandName", "hero", "sections", "ctas", "links", "contact", "seo", "theme"],
  properties: {
    slug: { type: "string", minLength: 2, pattern: "^[a-z0-9-]+$" },
    brandName: { type: "string", minLength: 1 },
    logoUrl: { type: "string", pattern: "^https://.+" },
    hero: heroSchema,
    sections: {
      type: "array",
      minItems: 1,
      items: contentSectionSchema
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
            enum: ["facebook", "instagram", "line", "linkedin", "map", "custom"]
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
    seo: seoSchema,
    theme: {
      type: "object",
      additionalProperties: false,
      required: ["tone", "primaryColor", "secondaryColor", "fontFamily"],
      properties: {
        tone: { enum: ["natural", "minimal", "business", "bold", "elegant"] },
        primaryColor: { type: "string", pattern: "^#([A-Fa-f0-9]{6})$" },
        secondaryColor: { type: "string", pattern: "^#([A-Fa-f0-9]{6})$" },
        fontFamily: { type: "string", minLength: 1 },
        darkMode: { type: "boolean" }
      }
    },
    pages: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["slug", "title", "hero", "sections", "seo"],
        properties: {
          slug: { type: "string", minLength: 1, pattern: "^[a-z0-9-]+$" },
          title: { type: "string", minLength: 1 },
          hero: heroSchema,
          sections: {
            type: "array",
            minItems: 1,
            items: contentSectionSchema
          },
          seo: seoSchema
        }
      }
    }
  }
} as const;

const ajv = new Ajv2020({ allErrors: true });
const _validate = ajv.compile(siteSpecJsonSchema);

export function validateSiteSpec(siteSpec: SiteSpec): string[] {
  const valid = _validate(siteSpec);
  if (valid) return [];

  const errors: string[] = [];
  for (const err of _validate.errors ?? []) {
    const msg = ajvErrorToMessage(err, siteSpec);
    if (msg && !errors.includes(msg)) errors.push(msg);
  }
  return errors;
}

function ajvErrorToMessage(err: ErrorObject, _spec: SiteSpec): string | null {
  const path: string = err.instancePath ?? "";
  const keyword: string = err.keyword ?? "";
  const params: Record<string, unknown> = (err.params as Record<string, unknown>) ?? {};

  if (
    path === "/slug" ||
    (path === "" && keyword === "pattern" && String(params["pattern"]).includes("a-z0-9"))
  ) {
    return "slug 必須為小寫英數與連字號";
  }

  if (path === "" && keyword === "required") {
    const missing = String(params["missingProperty"] ?? "");
    return `缺少必要欄位: ${missing}`;
  }

  const ctaMatch = path.match(/^\/ctas\/(\d+)\/url$/);
  if (ctaMatch) {
    return `ctas[${ctaMatch[1]}] url 非 https`;
  }

  const linkMatch = path.match(/^\/links\/(\d+)\/url$/);
  if (linkMatch) {
    return `links[${linkMatch[1]}] url 非 https`;
  }

  if (path === "/theme/primaryColor") return "theme.primaryColor 必須為 #RRGGBB";
  if (path === "/theme/secondaryColor") return "theme.secondaryColor 必須為 #RRGGBB";

  if (path === "/sections" && keyword === "minItems") return "sections 至少需要 1 筆";
  if (path === "/ctas" && keyword === "minItems") return "ctas 至少需要 1 筆";
  if (path === "/seo/keywords" && keyword === "minItems") return "seo.keywords 至少需要 1 筆";

  if (keyword === "minLength") return `${path} 不可為空字串`;
  if (keyword === "enum") return `${path} 值不合法`;
  if (keyword === "additionalProperties") {
    return `${path} 含有未知欄位: ${String(params["additionalProperty"] ?? "")}`;
  }

  return `${path} 驗證錯誤 (${keyword})`;
}
