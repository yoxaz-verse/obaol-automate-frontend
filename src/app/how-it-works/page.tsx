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
const EndToEndSection = dynamic(() => import("@/components/home/endtoend"), {
  loading: () => <section className="h-56 animate-pulse rounded-2xl bg-content2/70" />,
});
const SystemIntergrationSection = dynamic(() => import("@/components/home/systemintergration"), {
  loading: () => <section className="h-56 animate-pulse rounded-2xl bg-content2/70" />,
});

export const metadata: Metadata = {
  title: "How OBAOL Works | Commodity Trade Execution Flow",
  description:
    "Understand the OBAOL commodity trade execution flow across supplier verification, documentation, procurement, logistics, and closure.",
  alternates: {
    canonical: `${BASE_URL}/how-it-works`,
  },
  openGraph: {
    title: "How OBAOL Works | Commodity Trade Execution Flow",
    description:
      "Detailed process view of OBAOL’s execution pipeline from sourcing and verification to delivery milestones.",
    url: `${BASE_URL}/how-it-works`,
    type: "article",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "How OBAOL Works" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "How OBAOL Works | Commodity Trade Execution Flow",
    description:
      "See OBAOL’s structured process for dependable commodity trade execution.",
    images: ["/logo.png"],
  },
};
export default function HowItWorksPage() {
  return (
    <section>
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
      </ThemedContentWrapper>
      <CTASection />
      <Footer />
    </section>
  );
}
