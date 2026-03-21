import { buildMetadata, buildWebPageJsonLd } from "@/utils/seo";
import IndiaFirstNote from "@/components/seo/IndiaFirstNote";
import Content1 from "./content.mdx";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import ThemedContentWrapper from "@/components/layout/ThemedContentWrapper";

export const metadata = buildMetadata({
  title: "Disclaimer & Engagement Terms | OBAOL Supreme",
  description:
    "Starting in India, important information about OBAOL Supreme’s engagement model, responsibilities, and limitations as we expand globally.",
  keywords: ["disclaimer", "engagement terms", "OBAOL legal"],
  path: "/disclaimer",
});

const webPageJsonLd = buildWebPageJsonLd({
  title: "Disclaimer & Engagement Terms | OBAOL Supreme",
  description:
    "Important information about OBAOL Supreme’s engagement model, responsibilities, and limitations.",
  path: "/disclaimer",
});
export default function DisclaimerPage() {
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
        <Content1 />
      </ThemedContentWrapper>
      <Footer />
    </section>
  );
}
