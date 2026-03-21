import { buildMetadata, buildWebPageJsonLd } from "@/utils/seo";
import AboutContent1 from "./about.content.1.mdx";
import AboutContent2 from "./about.content.2.mdx";
import FadeIn from "./FadeIn";
import dynamic from "next/dynamic";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import CTASection from "@/components/home/ctasection";
import ThemedContentWrapper from "@/components/layout/ThemedContentWrapper";
import WhoCanUseObaol from "@/components/home/tradeoperatinglayer";

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
        <FadeIn>
          <AboutContent1 />
        </FadeIn>
        <FadeIn>
          <AboutContent2 />
        </FadeIn>
        <FadeIn>
          <section className="rounded-2xl border border-default-200 bg-content1/70 p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              India-first execution, built for global expansion
            </h2>
            <p className="mt-3 text-default-600 max-w-3xl">
              We start in India with procurement, warehousing, and logistics execution, while expanding
              across global commodity corridors including the GCC, Europe, and North America.
            </p>
          </section>
        </FadeIn>
      </ThemedContentWrapper>
      <CTASection />
      <Footer />
    </section>
  );
}
