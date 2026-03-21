import HomeContent from "@/components/home/HomeContent";
import { buildMetadata, buildWebPageJsonLd, buildWebSiteJsonLd } from "@/utils/seo";

export const metadata = buildMetadata({
  title: "OBAOL Supreme | Commodity & Agro Trading Platform",
  description:
    "Starting in India, OBAOL is a verified commodity trading operating system. Securely trade agro commodities with integrated procurement, logistics, and execution support as we expand globally.",
  keywords: [
    "agro commodities",
    "commodity trading",
    "supply chain",
    "procurement",
    "trade execution",
    "b2b trading",
    "verified suppliers",
  ],
  path: "/",
});

const webSiteJsonLd = buildWebSiteJsonLd();
const webPageJsonLd = buildWebPageJsonLd({
  title: "OBAOL Supreme | Commodity & Agro Trading Platform",
  description:
    "Verified commodity trade operating system for supplier discovery, verification, and execution support.",
  path: "/",
});

export default function HomePage() {
  return (
    <main className="bg-background text-foreground overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />

      <HomeContent />
    </main>
  );
}
