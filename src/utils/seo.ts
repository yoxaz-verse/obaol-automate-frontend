import type { Metadata } from "next";

export const BASE_URL = "https://obaol.com";
export const SITE_NAME = "OBAOL Supreme";
export const DEFAULT_OG_IMAGE = "/logo.png";

export const PRIMARY_MARKET = "India";

export const DEFAULT_DESCRIPTION =
  "Starting in India, OBAOL Supreme is a software-led commodity trade execution system combining online coordination with on-ground support for verified sourcing, documentation, logistics, and trade closure. We are expanding globally across key commodity corridors.";

export const DEFAULT_KEYWORDS = [
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
    title,
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
    name: SITE_NAME,
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${BASE_URL}/product?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
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
