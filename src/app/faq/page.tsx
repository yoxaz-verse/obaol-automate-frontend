import { Metadata } from "next";
import Header from "@/components/home/header";
import { FAQS, generateFaqSchema } from "./faqSchema";
import Footer from "@/components/home/footer";

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

      <section className="py-32 px-6 bg-black">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <header className="mb-16">
            <h1 className="text-3xl md:text-4xl font-semibold text-white">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 text-gray-400">
              Clear answers to common questions about OBAOL and its
              execution-focused trade system.
            </p>
          </header>

          {/* FAQ List */}
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <details
                key={faq.id}
                className="group border border-gray-800 rounded-lg bg-neutral-950"
              >
                <summary className="cursor-pointer list-none px-6 py-4 flex justify-between items-center">
                  <span className="text-white font-medium">
                    {faq.question}
                  </span>
                  <span className="text-gray-500 group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>

                <div className="px-6 pb-6 text-gray-300 leading-relaxed">
                  <p>{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
        </section>
  
        <Footer/>
        </>
  );
}
