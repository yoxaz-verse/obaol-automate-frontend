import { Metadata } from "next";
import AboutContent1 from "./about.content.1.mdx";
import AboutContent2 from "./about.content.2.mdx";
import FadeIn from "./FadeIn";
import dynamic from "next/dynamic";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import CTASection from "@/components/home/ctasection";
import ThemedContentWrapper from "@/components/layout/ThemedContentWrapper";
import WhoCanUseObaol from "@/components/home/tradeoperatinglayer";

const BASE_URL = "https://obaol.com";
const AboutSection = dynamic(() => import("@/components/home/aboutsection"), {
  loading: () => <section className="h-56 animate-pulse rounded-2xl bg-content2/70" />,
});
const StartedIn = dynamic(() => import("@/components/home/startedin"), {
  loading: () => <section className="h-56 animate-pulse rounded-2xl bg-content2/70" />,
});

export const metadata: Metadata = {
  title: "About OBAOL Supreme | Trade Execution Platform",
  description:
    "Learn about OBAOL Supreme, an execution-focused commodity trade platform built for reliable deal closure and operational accountability.",
  alternates: {
    canonical: `${BASE_URL}/about`,
  },
  openGraph: {
    title: "About OBAOL Supreme | Trade Execution Platform",
    description:
      "Understand OBAOL’s mission, execution model, and role in structured commodity trade operations.",
    url: `${BASE_URL}/about`,
    type: "article",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "About OBAOL" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About OBAOL Supreme | Trade Execution Platform",
    description:
      "Execution-focused commodity trade platform for buyers, suppliers, and operators.",
    images: ["/logo.png"],
  },
};
export default function AboutPage() {
  return (
    <section>
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
      </ThemedContentWrapper>
      <CTASection />
      <Footer />
    </section>
  );
}
