export type ScenarioStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
export type ScenarioBlockType = "heading" | "paragraph" | "ordered-list" | "unordered-list" | "quote" | "callout" | "image" | "workflow" | "result" | "faq" | "cta";

export type ScenarioBlock = {
  _id?: string;
  type: ScenarioBlockType;
  level?: 2 | 3 | 4;
  text?: string;
  title?: string;
  items?: string[];
  imageUrl?: string;
  imageAlt?: string;
  href?: string;
};

export type RealLifeScenario = {
  _id: string;
  internalTitle: string;
  h1: string;
  roleSlug: string;
  slug: string;
  excerpt: string;
  scenarioType: "REPRESENTATIVE";
  disclosureAccepted: boolean;
  blocks: ScenarioBlock[];
  primaryKeyword: string;
  supportingKeywords: string[];
  audienceIntent: string;
  seoTitle: string;
  seoDescription: string;
  heroImageUrl?: string;
  heroImageAlt?: string;
  faqs: Array<{ question: string; answer: string }>;
  cta?: { label?: string; href?: string };
  displayOrder: number;
  status: ScenarioStatus;
  scheduledAt?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};
