import type { Metadata } from "next";

export const BASE_URL = "https://obaol.com";
export const SITE_NAME = "OBAOL Supreme";
export const DEFAULT_OG_IMAGE = "/logo.png";

export const PRIMARY_MARKET = "India";

export const DEFAULT_DESCRIPTION =
  "OBAOL Supreme is an India-first B2B bulk trade execution platform for coordinating domestic and international agricultural commodity trade, from sourcing through logistics and closure.";

export const DEFAULT_KEYWORDS = [
  "B2B bulk trade execution platform",
  "bulk trade platform India",
  "domestic bulk trade platform",
  "international bulk trade execution",
  "agricultural commodity trade execution",
  "commodity trade execution",
  "agro commodity trade support",
  "buyer supplier coordination",
  "commodity sourcing system",
  "supplier buyer verification",
  "import export trade execution",
  "commodity logistics coordination",
  "trade documentation support",
  "physical commodity trading system",
];

export const GEO_KEYWORDS = [
  "India commodity trade",
  "India procurement",
  "India warehousing",
  "India export trade",
  "GCC sourcing",
  "UAE commodity trade",
  "Saudi Arabia importers",
  "European Union buyers",
  "EU agro commodities",
  "United States importers",
  "US commodity buyers",
  "global commodity trade",
];

const dedupe = (values: string[]) => {
  const seen = new Set<string>();
  return values
    .map((value) => String(value || "").trim())
    .filter((value) => {
      if (!value) return false;
      const key = value.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

export function buildMetadata({
  title,
  description,
  keywords = [],
  path = "",
  image = DEFAULT_OG_IMAGE,
  type = "website",
}: {
  title: string;
  description?: string;
  keywords?: string[];
  path?: string;
  image?: string;
  type?: "website" | "article";
}): Metadata {
  const canonical = `${BASE_URL}${path}`;
  const finalDescription = description || DEFAULT_DESCRIPTION;
  const finalKeywords = dedupe([...DEFAULT_KEYWORDS, ...keywords, ...GEO_KEYWORDS]);

  return {
    title: { absolute: title },
    description: finalDescription,
    keywords: finalKeywords,
    metadataBase: new URL(BASE_URL),
    alternates: { canonical },
    openGraph: {
      type,
      title,
      description: finalDescription,
      url: canonical,
      siteName: SITE_NAME,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: finalDescription,
      images: [image],
    },
    other: {
      "geo.region": "IN,AE,SA,EU,US",
      "geo.placename": "India, United Arab Emirates, Saudi Arabia, European Union, United States",
      distribution: "global",
    },
  };
}

export function buildWebPageJsonLd({
  title,
  description,
  path = "",
}: {
  title: string;
  description?: string;
  path?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${BASE_URL}${path}#webpage`,
    name: title,
    url: `${BASE_URL}${path}`,
    description: description || DEFAULT_DESCRIPTION,
    areaServed: [
      { "@type": "Country", name: "India" },
      { "@type": "Country", name: "United Arab Emirates" },
      { "@type": "Country", name: "Saudi Arabia" },
      { "@type": "Place", name: "European Union" },
      { "@type": "Country", name: "United States" },
    ],
  };
}

export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    name: SITE_NAME,
    url: BASE_URL,
    areaServed: [
      { "@type": "Country", name: "India" },
      { "@type": "Country", name: "United Arab Emirates" },
      { "@type": "Country", name: "Saudi Arabia" },
      { "@type": "Place", name: "European Union" },
      { "@type": "Country", name: "United States" },
    ],
    serviceArea: `Primary market: ${PRIMARY_MARKET}. Expanding globally.`,
  };
}
