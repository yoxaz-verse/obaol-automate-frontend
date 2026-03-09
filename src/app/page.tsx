import Footer from "@/components/home/footer";
import Header from "@/components/home/header";
import HeroSection from "@/components/home/herosection";
import CTASection from "@/components/home/ctasection";
import { Metadata } from "next";
import Link from "next/link";

const BASE_URL = "https://obaol.com";

export const metadata: Metadata = {
  title: "OBAOL Supreme | Commodity & Agro Trading Platform",
  description:
    "OBAOL is a verified commodity trading operating system. Securely trade agro commodities with integrated procurement, logistics, and trade execution.",
  keywords: ["Agro Commodities", "Commodity Trading", "Supply Chain", "Procurement", "Trade Execution", "OBAOL", "Agriculture", "B2B Trading"],
  authors: [{ name: "OBAOL Supreme" }],
  creator: "OBAOL Supreme",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    title: "OBAOL Supreme | Commodity & Agro Trading Platform",
    description: "Secure, verified agro commodity trading system. From procurement to logistics.",
    siteName: "OBAOL Supreme",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "OBAOL Supreme" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "OBAOL Supreme | Commodity & Agro Trading Platform",
    description: "Secure, verified agro commodity trading system.",
    images: ["/logo.png"],
    creator: "@obaol_supreme", // Placeholder if they have one, or remove
  },
  metadataBase: new URL(BASE_URL), // Important for resolving social images
  alternates: {
    canonical: BASE_URL,
  },
};

const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "OBAOL Supreme",
  url: BASE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${BASE_URL}/product?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "OBAOL Supreme | Commodity & Agro Trading Platform",
  url: BASE_URL,
  description:
    "Verified commodity trade operating system for supplier discovery, verification, and execution support.",
};

const quickProofPoints = [
  "Verified supplier network and structured execution workflows",
  "Documentation, procurement, logistics, and closure support in one system",
  "Built for serious commodity buyers, suppliers, and operators",
];

const intentCards = [
  {
    title: "Why OBAOL",
    description: "Understand why OBAOL is needed, what problem it solves, and why execution structure matters in real commodity trade.",
    href: "/why-obaol",
    cta: "Read Why OBAOL",
  },
  {
    title: "How OBAOL Works",
    description: "See the complete step-by-step execution model. This page also includes procurement, verification, logistics, and settlement flow.",
    href: "/how-it-works",
    cta: "View How It Works",
  },
];

export default function HomePage() {
  return (
    <main className="bg-background text-foreground overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />

      <Header />
      <HeroSection />

      <section className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16">
        <div className="rounded-2xl border border-default-200 bg-content1/70 p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Why choose OBAOL for commodity trade execution
          </h2>
          <p className="mt-3 text-default-600 max-w-3xl">
            OBAOL is designed to move trades from conversation to closure with operational discipline,
            verified counterparties, and execution support across critical milestones.
          </p>
          <ul className="mt-6 grid gap-3 md:grid-cols-3">
            {quickProofPoints.map((point) => (
              <li
                key={point}
                className="rounded-xl border border-default-200 bg-content2 px-4 py-3 text-sm md:text-base text-default-700"
              >
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-6 pb-14 md:pb-20">
        <div className="mb-5 md:mb-6">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Start With These Two Pages</h2>
          <p className="mt-2 text-default-600">
            Begin with why OBAOL is important, then understand the full step-by-step execution model.
            Procurement and operational flow are included inside the How It Works page.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {intentCards.map((card) => (
            <article
              key={card.href}
              className="rounded-2xl border border-default-200 bg-content1 p-5 md:p-6 shadow-sm"
            >
              <h3 className="text-lg md:text-xl font-semibold">{card.title}</h3>
              <p className="mt-2 text-sm md:text-base text-default-600">{card.description}</p>
              <Link
                href={card.href}
                className="mt-4 inline-flex items-center rounded-xl bg-warning-500 px-4 py-2 text-sm font-semibold text-black hover:bg-warning-400 transition-colors"
              >
                {card.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <CTASection />
      <Footer />
    </main>
  );
}
