import { Metadata } from "next";
import Header from "@/components/home/header";
import { FAQS, generateFaqSchema } from "./faqSchema";
import Footer from "@/components/home/footer";
import ThemedContentWrapper from "@/components/layout/ThemedContentWrapper";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | OBAOL",
  description:
    "Clear answers to common questions about OBAOL, its execution model, and who it is built for.",
};

export default function FAQPage() {
  const faqSchema = generateFaqSchema();

  return (
    <>
      <Header />

      {/* SEO: FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />

      <ThemedContentWrapper>
        {/* Page Header */}
        <header className="mb-16">
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-default-500">
            Clear answers to common questions about OBAOL and its
            execution-focused trade system.
          </p>
        </header>

        {/* FAQ List */}
        <div className="space-y-4">
          {FAQS.map((faq) => (
            <details
              key={faq.id}
              className="group border border-default-200 rounded-lg bg-content1"
            >
              <summary className="cursor-pointer list-none px-6 py-4 flex justify-between items-center">
                <span className="text-foreground font-medium">
                  {faq.question}
                </span>
                <span className="text-default-500 group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>

              <div className="px-6 pb-6 text-default-600 leading-relaxed border-t border-default-100 mt-4 pt-4">
                <p>{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </ThemedContentWrapper>

      <Footer />
    </>
  );
}
