import { buildMetadata, buildWebPageJsonLd } from "@/utils/seo";
import Content1 from "./content.1.mdx";
import Content2 from "./content.2.mdx";
import FadeIn from "./FadeIn";
import ProcurementSpecialistSection from "@/components/home/procurementprocess";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import ThemedContentWrapper from "@/components/layout/ThemedContentWrapper";

export const metadata = buildMetadata({
  title: "Procurement & Verification Support | OBAOL",
  description:
    "Starting in India, explore OBAOL procurement and verification support for consistent commodity sourcing quality and execution reliability as we expand globally.",
  keywords: ["procurement support", "verification process", "commodity sourcing"],
  path: "/procurement",
  type: "article",
});

const webPageJsonLd = buildWebPageJsonLd({
  title: "Procurement & Verification Support | OBAOL",
  description:
    "Structured procurement, on-ground checks, and verification processes for commodity trade operations.",
  path: "/procurement",
});
export default function ProcurementPage() {
  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <Header />
      <ThemedContentWrapper>
        <FadeIn>
          <Content1 />
        </FadeIn>
        <ProcurementSpecialistSection key="procurement-specialist-section" />
        <FadeIn>
          <Content2 />
        </FadeIn>
        <FadeIn>
          <section className="rounded-2xl border border-default-200 bg-content1/70 p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              India-first procurement with global execution expansion
            </h2>
            <p className="mt-3 text-default-600 max-w-3xl">
              We begin with India-based procurement, verification, and on-ground checks, then expand
              across GCC markets, Europe, and the United States for cross-border commodity flows.
            </p>
          </section>
        </FadeIn>
      </ThemedContentWrapper>
      <Footer />
    </section>
  );
}
