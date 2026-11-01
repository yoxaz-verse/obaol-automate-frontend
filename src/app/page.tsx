import HomeContent from "@/components/home/HomeContent";
import { buildMetadata, buildWebPageJsonLd } from "@/utils/seo";

export const metadata = buildMetadata({
  title: "B2B Bulk Trade Execution Platform | OBAOL Supreme",
  description:
    "OBAOL Supreme connects bulk trade participants and execution partners to coordinate domestic and international agricultural commodity trade, from sourcing to logistics.",
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

const webPageJsonLd = buildWebPageJsonLd({
  title: "The B2B Bulk Trade Execution Platform",
  description:
    "OBAOL Supreme connects bulk trade participants and execution partners across sourcing, verification, documentation, logistics, and trade closure.",
  path: "/",
});

export default function HomePage() {
  return (
    <main className="obaol-home bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />

      <HomeContent />
    </main>
  );
}
