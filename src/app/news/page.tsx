import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import dynamic from "next/dynamic";
import { Metadata } from "next";

const BASE_URL = "https://obaol.com";

export const metadata: Metadata = {
  title: "Trade News | OBAOL Supreme",
  description: "Global agro‑trade news by continent and country. Track commodity market signals, logistics updates, and regional trade intelligence.",
  keywords: [
    "agro trade news",
    "commodity news",
    "global trade updates",
    "agriculture market",
    "export import news",
    "supply chain news",
    "freight updates",
  ],
  alternates: {
    canonical: `${BASE_URL}/news`,
  },
  openGraph: {
    title: "Trade News | OBAOL Supreme",
    description: "Curated agro‑trade updates from global sources by continent and country.",
    url: `${BASE_URL}/news`,
    type: "website",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "OBAOL Trade News" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trade News | OBAOL Supreme",
    description: "Global agro‑trade news and commodity signals by region.",
    images: ["/logo.png"],
  },
};

const NewsPageContent = dynamic(() => import("@/components/news/NewsPageContent"), { ssr: false });

export default function NewsPage() {
  const newsJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "OBAOL Trade News",
    description: "Global agro‑trade updates from curated RSS sources across continents.",
    url: `${BASE_URL}/news`,
    isPartOf: {
      "@type": "WebSite",
      name: "OBAOL Supreme",
      url: BASE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsJsonLd) }}
      />
      <Header />
      <main className="pt-24 min-h-screen">
        <NewsPageContent variant="public" />
      </main>
      <Footer />
    </>
  );
}
