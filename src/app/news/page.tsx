import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import dynamic from "next/dynamic";
import { buildMetadata } from "@/utils/seo";
import IndiaFirstNote from "@/components/seo/IndiaFirstNote";

export const metadata = buildMetadata({
  title: "Trade News | OBAOL Supreme",
  description:
    "Starting in India, track global agro-trade news by continent and country. Follow commodity market signals, logistics updates, and regional trade intelligence as we expand globally.",
  keywords: [
    "agro trade news",
    "commodity news",
    "global trade updates",
    "agriculture market",
    "export import news",
    "supply chain news",
    "freight updates",
  ],
  path: "/news",
});

const NewsPageContent = dynamic(() => import("@/components/news/NewsPageContent"), { ssr: false });

export default function NewsPage() {
  const newsJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "OBAOL Trade News",
    description: "Global agro‑trade updates from curated RSS sources across continents.",
    url: "https://obaol.com/news",
    isPartOf: {
      "@type": "WebSite",
      name: "OBAOL Supreme",
      url: "https://obaol.com",
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
        <div className="mx-auto w-[95%] max-w-6xl px-4 md:px-6 pb-6">
          <IndiaFirstNote />
        </div>
        <NewsPageContent variant="public" />
      </main>
      <Footer />
    </>
  );
}
