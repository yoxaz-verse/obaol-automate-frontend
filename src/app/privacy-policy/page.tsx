import { buildMetadata, buildWebPageJsonLd } from "@/utils/seo";
import IndiaFirstNote from "@/components/seo/IndiaFirstNote";
import Content1 from "./content.mdx";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import ThemedContentWrapper from "@/components/layout/ThemedContentWrapper";

export const metadata = buildMetadata({
  title: "Privacy Policy | OBAOL Supreme",
  description:
    "Starting in India, learn how OBAOL Supreme collects, uses, and protects your information within its verified agro trade ecosystem as we expand globally.",
  keywords: ["privacy policy", "data protection", "OBAOL compliance"],
  path: "/privacy-policy",
});

const webPageJsonLd = buildWebPageJsonLd({
  title: "Privacy Policy | OBAOL Supreme",
  description:
    "Learn how OBAOL Supreme collects, uses, and protects your information within its verified agro trade ecosystem.",
  path: "/privacy-policy",
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
