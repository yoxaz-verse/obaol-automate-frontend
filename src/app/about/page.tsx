import { buildMetadata, buildWebPageJsonLd } from "@/utils/seo";
import dynamic from "next/dynamic";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import CTASection from "@/components/home/ctasection";
import WhoCanUseObaol from "@/components/home/tradeoperatinglayer";
import AboutExecutionFramework from "@/components/about/AboutExecutionFramework";

const AboutSection = dynamic(() => import("@/components/home/aboutsection"), {
  loading: () => <section className="h-56 animate-pulse rounded-2xl bg-content2/70" />,
});
const StartedIn = dynamic(() => import("@/components/home/startedin"), {
  loading: () => <section className="h-56 animate-pulse rounded-2xl bg-content2/70" />,
});

export const metadata = buildMetadata({
  title: "About OBAOL Supreme | B2B Bulk Trade Execution",
  description:
    "OBAOL Supreme is an India-first B2B bulk trade execution platform connecting registered companies across sourcing, documents, services, logistics, and closure.",
  keywords: ["B2B bulk trade execution", "commodity workflow coordination", "buyer supplier collaboration", "trade service providers", "India commodity trade platform"],
  path: "/about",
  type: "article",
});

const webPageJsonLd = buildWebPageJsonLd({
  title: "About OBAOL Supreme | B2B Bulk Trade Execution",
  description:
    "Understand OBAOL’s India-first mission, company roles, execution model, and boundaries across domestic and international bulk commodity trade.",
  path: "/about",
});
export default function AboutPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <Header />
      <WhoCanUseObaol />
      <div className="bg-background text-foreground">
        <AboutSection key="about-section" />
        <StartedIn key="started-in-section" />
        <AboutExecutionFramework />
      </div>
      <CTASection
        eyebrow="Choose the right participation path"
        title="Find the OBAOL Role That Matches Your Business"
        description="Registered companies select the buying, selling, or service capabilities that should shape their workspace and responsibilities."
        href="/roles"
        label="Explore Platform Roles"
      />
      <Footer />
    </main>
  );
}
