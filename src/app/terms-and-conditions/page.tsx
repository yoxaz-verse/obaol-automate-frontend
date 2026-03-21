import { buildMetadata, buildWebPageJsonLd } from "@/utils/seo";
import IndiaFirstNote from "@/components/seo/IndiaFirstNote";
import Content1 from "./content.mdx";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import ThemedContentWrapper from "@/components/layout/ThemedContentWrapper";

export const metadata = buildMetadata({
  title: "Terms and Conditions | OBAOL Supreme",
  description:
    "Starting in India, terms and conditions governing access to and use of the OBAOL Supreme ecosystem as we expand globally.",
  keywords: ["terms and conditions", "OBAOL legal", "platform terms"],
  path: "/terms-and-conditions",
});

const webPageJsonLd = buildWebPageJsonLd({
  title: "Terms and Conditions | OBAOL Supreme",
  description:
    "Terms and conditions governing access to and use of the OBAOL Supreme ecosystem.",
  path: "/terms-and-conditions",
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
