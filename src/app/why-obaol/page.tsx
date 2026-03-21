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

const StatementSection = dynamic(() => import("@/components/home/statementsection"), {
  loading: () => <section className="h-40 animate-pulse rounded-2xl bg-content2/70" />,
});
const BrokenTradeSystemSection = dynamic(() => import("@/components/home/brokentradesystemsection"), {
  loading: () => <section className="h-56 animate-pulse rounded-2xl bg-content2/70" />,
});
const CommodityServicesSection = dynamic(() => import("@/components/home/commodityservices"), {
  loading: () => <section className="h-56 animate-pulse rounded-2xl bg-content2/70" />,
});

export const metadata = buildMetadata({
  title: "Why OBAOL | Execution vs Traditional B2B",
  description:
    "Starting in India, see why OBAOL differs from traditional listing-led B2B platforms and how it reduces execution risk in commodity trade as we expand globally.",
  keywords: ["execution-led trade", "commodity risk reduction", "verified b2b trade"],
  path: "/why-obaol",
  type: "article",
});

const webPageJsonLd = buildWebPageJsonLd({
  title: "Why OBAOL | Execution vs Traditional B2B",
  description:
    "Execution-first commodity trade model built for closure, accountability, and verified workflows.",
  path: "/why-obaol",
});
export default function WhyObaolPage() {
  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <Header />
      <StatementSection key="statement-section" />
      <BrokenTradeSystemSection key="broken-trade-section" />
      <CommodityServicesSection key="commodity-services-section" />
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
              India-first execution with global expansion built in
            </h2>
            <p className="mt-3 text-default-600 max-w-3xl">
              We start with India-based procurement and execution, then expand across GCC trade hubs, Europe,
              and the US to bring structured accountability beyond listing-only platforms.
            </p>
          </section>
        </FadeIn>
      </ThemedContentWrapper>
      <CTASection />
      <Footer />
    </section>
  );
}
