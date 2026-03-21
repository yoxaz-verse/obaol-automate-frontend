import { buildMetadata, buildWebPageJsonLd } from "@/utils/seo";
import IndiaFirstNote from "@/components/seo/IndiaFirstNote";
import Content1 from "./content.1.mdx";
import Content2 from "./content.2.mdx";
import FadeIn from "./FadeIn";
import { Spacer } from "@nextui-org/react";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import ThemedContentWrapper from "@/components/layout/ThemedContentWrapper";

export const metadata = buildMetadata({
  title: "Procurement Support | OBAOL Supreme",
  description:
    "Starting in India, OBAOL provides structured procurement support to ensure commodity sourcing executes reliably and as agreed as we expand globally.",
  keywords: ["procurement support", "verification", "commodity sourcing"],
  path: "/verification",
});

const webPageJsonLd = buildWebPageJsonLd({
  title: "Procurement Support | OBAOL Supreme",
  description:
    "OBAOL provides structured procurement support to ensure commodity sourcing executes reliably and as agreed.",
  path: "/verification",
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
        <div className="mb-6">
          <IndiaFirstNote />
        </div>
        <FadeIn>
          <Content1 />
        </FadeIn>
        <Spacer y={32} />
        <FadeIn>
          <Content2 />
        </FadeIn>
      </ThemedContentWrapper>
      <Footer />
    </section>
  );
}
