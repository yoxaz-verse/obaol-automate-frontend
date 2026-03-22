import { buildMetadata, buildWebPageJsonLd } from "@/utils/seo";
import dynamic from "next/dynamic";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import CTASection from "@/components/home/ctasection";
import ThemedContentWrapper from "@/components/layout/ThemedContentWrapper";
import WhoCanUseObaol from "@/components/home/tradeoperatinglayer";
import AboutExecutionFramework from "@/components/about/AboutExecutionFramework";

const AboutSection = dynamic(() => import("@/components/home/aboutsection"), {
  loading: () => <section className="h-56 animate-pulse rounded-2xl bg-content2/70" />,
});
const StartedIn = dynamic(() => import("@/components/home/startedin"), {
  loading: () => <section className="h-56 animate-pulse rounded-2xl bg-content2/70" />,
});

export const metadata = buildMetadata({
  title: "About OBAOL Supreme | Trade Execution Platform",
  description:
    "Starting in India, OBAOL Supreme is an execution-focused commodity trade platform built for reliable deal closure and operational accountability as we expand globally.",
  keywords: ["trade execution platform", "commodity operations", "supplier coordination", "buyer verification"],
  path: "/about",
  type: "article",
});

const webPageJsonLd = buildWebPageJsonLd({
  title: "About OBAOL Supreme | Trade Execution Platform",
  description:
    "Understand OBAOL’s mission, execution model, and role in structured commodity trade operations.",
  path: "/about",
});
export default function AboutPage() {
  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <Header />
      <WhoCanUseObaol />
      <ThemedContentWrapper>
        <AboutSection key="about-section" />
        <StartedIn key="started-in-section" />
        <AboutExecutionFramework />
      </ThemedContentWrapper>
      <CTASection />
      <Footer />
    </section>
  );
}
