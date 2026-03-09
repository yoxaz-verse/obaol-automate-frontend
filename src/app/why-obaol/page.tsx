import { Metadata } from "next";
import Content1 from "./content.1.mdx";
import Content2 from "./content.2.mdx";
import FadeIn from "./FadeIn";
import dynamic from "next/dynamic";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import CTASection from "@/components/home/ctasection";
import ThemedContentWrapper from "@/components/layout/ThemedContentWrapper";
import ProcurementSpecialistSection from "@/components/home/procurementprocess";

const BASE_URL = "https://obaol.com";
const StatementSection = dynamic(() => import("@/components/home/statementsection"), {
  loading: () => <section className="h-40 animate-pulse rounded-2xl bg-content2/70" />,
});
const BrokenTradeSystemSection = dynamic(() => import("@/components/home/brokentradesystemsection"), {
  loading: () => <section className="h-56 animate-pulse rounded-2xl bg-content2/70" />,
});
const CommodityServicesSection = dynamic(() => import("@/components/home/commodityservices"), {
  loading: () => <section className="h-56 animate-pulse rounded-2xl bg-content2/70" />,
});

export const metadata: Metadata = {
  title: "Why OBAOL | Execution vs Traditional B2B",
  description:
    "See why OBAOL differs from traditional listing-led B2B platforms and how it reduces execution risk in commodity trade.",
  alternates: {
    canonical: `${BASE_URL}/why-obaol`,
  },
  openGraph: {
    title: "Why OBAOL | Execution vs Traditional B2B",
    description:
      "Compare OBAOL’s execution-led model with conventional B2B systems for serious commodity trading outcomes.",
    url: `${BASE_URL}/why-obaol`,
    type: "article",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "Why OBAOL" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Why OBAOL | Execution vs Traditional B2B",
    description:
      "Execution-first commodity trade model built for closure, accountability, and verified workflows.",
    images: ["/logo.png"],
  },
};
export default function WhyObaolPage() {
  return (
    <section>
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
      </ThemedContentWrapper>
      <CTASection />
      <Footer />
    </section>
  );
}
