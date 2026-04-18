export type ThemeTone = "natural" | "minimal" | "business";

export interface HeroSection {
  title: string;
  subtitle: string;
  description: string;
}

export interface CallToAction {
  label: string;
  url: string;
  style: "primary" | "secondary" | "ghost";
}

export interface LinkItem {
  label: string;
  url: string;
  icon?: "facebook" | "instagram" | "line" | "linkedin" | "map" | "custom";
}

export interface ContentSection {
  id: string;
  heading: string;
  body: string;
}

export interface ContactInfo {
  address?: string;
  phone?: string;
  email?: string;
}

export interface SeoMeta {
  title: string;
  description: string;
  keywords: string[];
}

export interface SiteTheme {
  tone: ThemeTone;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
}

export interface SubPage {
  slug: string;
  title: string;
  hero: HeroSection;
  sections: ContentSection[];
  seo: SeoMeta;
}

export interface SiteSpec {
  slug: string;
  brandName: string;
  hero: HeroSection;
  sections: ContentSection[];
  ctas: CallToAction[];
  links: LinkItem[];
  contact: ContactInfo;
  seo: SeoMeta;
  theme: SiteTheme;
  pages?: SubPage[];
}
