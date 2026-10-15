import HomeContent from "@/components/home/HomeContent";
import { buildMetadata, buildWebPageJsonLd, buildWebSiteJsonLd } from "@/utils/seo";

export const metadata = buildMetadata({
  title: "OBAOL Supreme | B2B Agro Execution System",
  description:
    "Join OBAOL's open-registration B2B agro execution platform, connecting verified buyers, suppliers, and specialist service partners without invitation-only access.",
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
    "An open-registration platform connecting verified buyers, suppliers, and specialist partners across discovery, procurement, verification, logistics, and delivery.",
  path: "/",
});

export default function HomePage() {
  return (
    <main className="obaol-home bg-background text-foreground">
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
