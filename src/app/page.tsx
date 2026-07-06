import HomeContent from "@/components/home/HomeContent";
import { buildMetadata, buildWebPageJsonLd, buildWebSiteJsonLd } from "@/utils/seo";

export const metadata = buildMetadata({
  title: "OBAOL Supreme | B2B Agro Execution System",
  description:
    "Starting in India, OBAOL is a verified B2B agro execution system. Plan procurement, run verification, manage logistics, and move orders in one connected system.",
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
  title: "OBAOL Supreme | B2B Agro Execution System",
  description:
    "Verified B2B agro execution system for procurement, verification, logistics, and order execution.",
  path: "/",
});

export default function HomePage() {
  return (
    <main className="obaol-home bg-background text-foreground overflow-hidden">
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
