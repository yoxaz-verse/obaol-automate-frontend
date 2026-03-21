import { buildMetadata, buildWebPageJsonLd } from "@/utils/seo";
import Content1 from "./content.1.mdx";
import Content2 from "./content.2.mdx";
import FadeIn from "./FadeIn";
import dynamic from "next/dynamic";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import CTASection from "@/components/home/ctasection";
import ThemedContentWrapper from "@/components/layout/ThemedContentWrapper";
import ProcurementSpecialistSection from "@/components/home/procurementprocess";

const EndToEndSection = dynamic(() => import("@/components/home/endtoend"), {
  loading: () => <section className="h-56 animate-pulse rounded-2xl bg-content2/70" />,
});
const SystemIntergrationSection = dynamic(() => import("@/components/home/systemintergration"), {
  loading: () => <section className="h-56 animate-pulse rounded-2xl bg-content2/70" />,
});

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
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <Header />
      <EndToEndSection key="end-to-end-section" />
      <SystemIntergrationSection key="system-integration-section" />
      <ProcurementSpecialistSection key="procurement-specialist-section" />
      <ThemedContentWrapper>
        <FadeIn>
          <Content1 />
        </FadeIn>
        <FadeIn>
          <Content2 />
        </FadeIn>
        <FadeIn>
          <section className="rounded-2xl border border-default-200 bg-content1/70 p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              India-first execution flow, designed to scale globally
            </h2>
            <p className="mt-3 text-default-600 max-w-3xl">
              The OBAOL flow begins in India with procurement, documentation, and logistics execution,
              then scales across GCC trading hubs, Europe, and North America for cross-border commodity trade.
            </p>
          </section>
        </FadeIn>
      </ThemedContentWrapper>
      <CTASection />
      <Footer />
    </section>
  );
}
