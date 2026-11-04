import { buildMetadata, buildWebPageJsonLd } from "@/utils/seo";
import IndiaFirstNote from "@/components/seo/IndiaFirstNote";
import Header from "@/components/home/header";
import Link from "next/link";
import { generateFaqSchema } from "./faqSchema";
import FaqExplorer from "./FaqExplorer";
import Footer from "@/components/home/footer";
import ThemedContentWrapper from "@/components/layout/ThemedContentWrapper";

export const metadata = buildMetadata({
  title: "OBAOL Platform Guide & Frequently Asked Questions",
  description:
    "Understand OBAOL Supreme, its roles, verification, sourcing, documents, logistics, execution model, pricing, AI tools, and India-first global trade support.",
  keywords: ["OBAOL FAQ", "trade execution platform guide", "commodity trade questions", "OBAOL roles", "trade verification"],
  path: "/faq",
});

const webPageJsonLd = buildWebPageJsonLd({
  title: "OBAOL Platform Guide & Frequently Asked Questions",
  description:
    "Clear answers about OBAOL Supreme, its participants, workflows, execution model, technology, responsibilities, and market coverage.",
  path: "/faq",
});

export default function FAQPage() {
  const faqSchema = generateFaqSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <Header />

      {/* SEO: FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />

      <ThemedContentWrapper>
        <header className="mb-12 max-w-5xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary">Platform guide</p>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
            Understand OBAOL, from first enquiry to trade closure
          </h1>
          <p className="mt-6 max-w-4xl text-lg leading-8 text-default-500 md:text-xl">
            OBAOL Supreme is an India-first B2B bulk-trade execution platform. This guide explains who it is for, how its workflows connect, where technology helps, and which responsibilities always remain with participating companies.
          </p>
          <div className="mt-6 max-w-3xl">
            <IndiaFirstNote />
          </div>
          <nav aria-label="Related platform information" className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
            <Link href="/about" className="text-primary underline-offset-4 hover:underline">About the platform</Link>
            <Link href="/roles" className="text-primary underline-offset-4 hover:underline">Choose your role</Link>
            <Link href="/verification" className="text-primary underline-offset-4 hover:underline">Verification framework</Link>
            <Link href="/disclaimer" className="text-primary underline-offset-4 hover:underline">Responsibilities and limitations</Link>
          </nav>
        </header>

        <FaqExplorer />
      </ThemedContentWrapper>

      <Footer />
    </>
  );
}
