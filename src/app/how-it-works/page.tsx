import { buildMetadata, buildWebPageJsonLd } from "@/utils/seo";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import CTASection from "@/components/home/ctasection";
import HowItWorksOperationalPipeline from "@/components/how-it-works/HowItWorksOperationalPipeline";

export const metadata = buildMetadata({
  title: "How OBAOL Works | Commodity Trade Execution Flow",
  description:
    "Starting in India, understand the OBAOL commodity trade execution flow across supplier verification, documentation, procurement, logistics, and closure as we expand globally.",
  keywords: ["commodity execution flow", "trade process", "procurement logistics"],
  path: "/how-it-works",
  type: "article",
});

const webPageJsonLd = buildWebPageJsonLd({
  title: "How OBAOL Works | Commodity Trade Execution Flow",
  description:
    "Detailed process view of OBAOL’s execution pipeline from sourcing and verification to delivery milestones.",
  path: "/how-it-works",
});
export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <Header />
      <main>
        <HowItWorksOperationalPipeline />
      </main>
      <CTASection />
      <Footer />
    </div>
  );
}
