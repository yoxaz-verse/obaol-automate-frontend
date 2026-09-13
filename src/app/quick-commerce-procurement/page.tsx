import RevealImage from "@/components/ui/RevealImage";
import Link from "next/link";
import {
  FiArrowRight,
  FiBarChart2,
  FiCheckCircle,
  FiClipboard,
  FiClock,
  FiFileText,
  FiMapPin,
  FiPackage,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiTruck,
} from "react-icons/fi";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import { buildMetadata, buildWebPageJsonLd } from "@/utils/seo";
import { BASE_URL } from "@/utils/seo";

const pageTitle = "Quick Commerce Procurement Support for Blinkit, Zepto & Instamart Teams";
const pageDescription =
  "OBAOL helps quick commerce procurement, sourcing, and replenishment teams coordinate verified agro supply, supplier checks, documentation, dispatch readiness, and execution workflows.";
const pagePath = "/quick-commerce-procurement";

export const metadata = buildMetadata({
  title: pageTitle,
  description: pageDescription,
  keywords: [
    "quick commerce procurement",
    "Blinkit procurement support",
    "Zepto procurement support",
    "Instamart procurement support",
    "quick commerce sourcing",
    "q-commerce supply chain",
    "grocery procurement platform",
    "dark store replenishment",
    "verified agro suppliers",
    "FMCG sourcing support",
    "quick commerce vendor onboarding",
    "India quick commerce supply chain",
  ],
  path: pagePath,
  image: "/images/order-execution-laptop.png",
  type: "article",
});

const webPageJsonLd = buildWebPageJsonLd({
  title: pageTitle,
  description: pageDescription,
  path: pagePath,
});

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Quick Commerce Procurement Support",
  serviceType: "Procurement coordination and supplier execution support",
  provider: {
    "@type": "Organization",
    name: "OBAOL Supreme",
    url: BASE_URL,
  },
  areaServed: {
    "@type": "Country",
    name: "India",
  },
  audience: {
    "@type": "BusinessAudience",
    name: "Quick commerce procurement, sourcing, category, and replenishment teams",
  },
  description: pageDescription,
  offers: {
    "@type": "Offer",
    availability: "https://schema.org/InStock",
    url: `${BASE_URL}${pagePath}`,
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How does OBAOL help quick commerce procurement teams?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "OBAOL supports requirement clarity, supplier discovery, vendor checks, documentation coordination, dispatch readiness, and execution tracking for quick commerce procurement workflows.",
      },
    },
    {
      "@type": "Question",
      name: "Is this useful for teams like Blinkit, Zepto, and Instamart?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The page is designed for quick commerce and instant grocery teams that need faster sourcing, cleaner vendor onboarding, reliable supply checks, and better coordination across high-frequency replenishment operations.",
      },
    },
    {
      "@type": "Question",
      name: "Does OBAOL own inventory or act as the seller?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "OBAOL does not position itself as the inventory owner or seller on this page. It supports execution discipline, verified coordination, and process clarity between quick commerce teams, suppliers, and operational partners.",
      },
    },
  ],
};

const platformNeeds = [
  "Fresh and grocery categories need repeatable sourcing, not one-off supplier calls.",
  "Fast-moving SKUs need supplier readiness checks before teams commit shelf or dark-store space.",
  "Regional assortment expansion needs local supplier discovery, validation, and coordination.",
  "Procurement teams need cleaner handoffs across sample review, price alignment, documentation, dispatch, and issue resolution.",
];

const supportPillars = [
  {
    icon: FiSearch,
    title: "Supplier Discovery",
    text: "Identify and organize relevant agro, grocery, FMCG, and regional suppliers for quick commerce category needs.",
  },
  {
    icon: FiShield,
    title: "Vendor Verification",
    text: "Check supplier identity, product readiness, capacity signals, location fit, and execution reliability before deeper engagement.",
  },
  {
    icon: FiClipboard,
    title: "Requirement Structuring",
    text: "Convert category needs into clear product specifications, quantity expectations, locations, timelines, documents, and responsibility flows.",
  },
  {
    icon: FiTruck,
    title: "Dispatch Coordination",
    text: "Coordinate the path from confirmation to dispatch with visibility into readiness, deviations, logistics handoffs, and issue escalation.",
  },
  {
    icon: FiRefreshCw,
    title: "Repeat Procurement Flow",
    text: "Help teams move from ad hoc sourcing to a reusable process for replenishment, alternate suppliers, and multi-city expansion.",
  },
  {
    icon: FiBarChart2,
    title: "Operational Visibility",
    text: "Keep procurement, category, and operations teams aligned with structured status signals instead of scattered follow-ups.",
  },
];

const processSteps = [
  "Share the category, SKU, quantity, city, quality, packaging, and delivery expectations.",
  "OBAOL structures the requirement and maps the right supplier or execution partner workflow.",
  "Supplier readiness, documents, capacity, and location fit are checked before commitments move forward.",
  "Procurement, verification, logistics, and issue tracking are coordinated through the OBAOL workflow.",
  "Teams can convert successful flows into repeatable procurement routes for future replenishment.",
];

const seoTargets = [
  "Quick commerce procurement support in India",
  "Blinkit vendor sourcing and grocery procurement support",
  "Zepto supplier verification and replenishment support",
  "Instamart supplier onboarding and procurement coordination",
  "Dark store supply chain and grocery replenishment execution",
];

export default function QuickCommerceProcurementPage() {
  return (
    <section className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Header />

      <main className="overflow-hidden">
        <section className="relative border-b border-foreground/10 px-6 pb-20 pt-32 md:pt-36">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(207,152,60,0.14),transparent_36%,rgba(24,99,132,0.10))]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="mb-5 inline-flex rounded-full border border-obaol-300/35 bg-obaol-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-obaol-700 dark:text-obaol-300">
                Quick commerce procurement support
              </p>
              <h1 className="max-w-5xl text-4xl font-black leading-[1.04] tracking-tight md:text-6xl">
                Verified sourcing and execution support for Blinkit, Zepto, Instamart-style teams
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-foreground/70 md:text-xl">
                OBAOL helps quick commerce procurement, category, and replenishment teams move from scattered supplier follow-ups to a structured execution flow for agro, grocery, FMCG, and regional supply needs.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/auth"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-obaol-300/40 bg-obaol-500 px-6 py-3 text-sm font-black text-obaol-950 shadow-[0_16px_38px_-20px_rgba(207,152,60,0.86)] transition-all hover:-translate-y-0.5 hover:bg-obaol-400"
                >
                  Start a procurement workflow <FiArrowRight />
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-foreground/15 px-6 py-3 text-sm font-bold text-foreground/80 transition-all hover:bg-foreground/[0.06] hover:text-foreground"
                >
                  See how OBAOL works
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-obaol-500/10 blur-2xl public-decoration" />
              <div className="relative overflow-hidden rounded-[2rem] border border-foreground/10 bg-content1 shadow-[0_28px_80px_-45px_rgba(0,0,0,0.7)] public-surface-card">
                <RevealImage
                  src="/images/order-execution-laptop.png"
                  alt="OBAOL procurement execution workspace"
                  width={980}
                  height={720}
                  priority
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="grid gap-3 border-t border-foreground/10 bg-background/90 p-5 sm:grid-cols-3">
                  {[
                    ["01", "Source"],
                    ["02", "Verify"],
                    ["03", "Execute"],
                  ].map(([num, label]) => (
                    <div key={label} className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-4">
                      <p className="text-xs font-black text-obaol-700 dark:text-obaol-300">{num}</p>
                      <p className="mt-1 text-sm font-bold">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-20 public-standard-section">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-obaol-700 dark:text-obaol-300">
                Why quick commerce needs a different operating layer
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
                Fast delivery depends on disciplined upstream procurement.
              </h2>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {platformNeeds.map((need) => (
                <div key={need} className="flex gap-4 rounded-2xl border border-foreground/10 bg-content1 p-6">
                  <FiCheckCircle className="mt-1 h-5 w-5 shrink-0 text-obaol-600 dark:text-obaol-300" />
                  <p className="text-base leading-7 text-foreground/75">{need}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-foreground/10 bg-foreground/[0.03] px-6 py-20 public-standard-section">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-obaol-700 dark:text-obaol-300">
                  What OBAOL provides
                </p>
                <h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
                  A cleaner way to run sourcing, verification, and execution.
                </h2>
                <p className="mt-5 text-lg leading-8 text-foreground/65">
                  The goal is not another static vendor list. The goal is a workflow that helps a quick commerce team know what is ready, what is risky, what needs action, and who owns the next step.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {supportPillars.map((pillar) => {
                  const Icon = pillar.icon;
                  return (
                    <article key={pillar.title} className="rounded-2xl border border-foreground/10 bg-background p-6 shadow-[0_18px_45px_-34px_rgba(0,0,0,0.6)]">
                      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-obaol-500/12 text-obaol-700 dark:text-obaol-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-black">{pillar.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-foreground/65">{pillar.text}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-20 public-standard-section">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2rem] border border-foreground/10 bg-content1 p-8 md:p-10 public-surface-card">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-obaol-700 dark:text-obaol-300">
                Practical workflow
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
                From requirement to repeatable procurement route.
              </h2>
              <div className="mt-8 space-y-5">
                {processSteps.map((step, index) => (
                  <div key={step} className="flex gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-obaol-300/35 bg-obaol-500/10 text-sm font-black text-obaol-700 dark:text-obaol-300">
                      {index + 1}
                    </div>
                    <p className="pt-1 text-base leading-7 text-foreground/72">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: FiPackage, title: "Agro and grocery SKUs", text: "Commodity, fresh, processed, packaged, and regional supply categories." },
                { icon: FiMapPin, title: "City and zone readiness", text: "Supplier and dispatch alignment around practical delivery locations." },
                { icon: FiClock, title: "Timeline discipline", text: "Status clarity when procurement is time-sensitive and replenishment cannot wait." },
                { icon: FiFileText, title: "Documentation flow", text: "Cleaner handoffs for supplier records, invoices, quality details, and dispatch documents." },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl border border-foreground/10 bg-content1 p-7">
                    <Icon className="h-7 w-7 text-obaol-700 dark:text-obaol-300" />
                    <h3 className="mt-5 text-xl font-black">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-foreground/65">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-foreground/10 bg-content1 px-6 py-20 public-standard-section">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-obaol-700 dark:text-obaol-300">
                  SEO focus
                </p>
                <h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
                  Built for the exact searches quick commerce teams make.
                </h2>
                <p className="mt-5 text-lg leading-8 text-foreground/65">
                  This page targets high-intent procurement, supplier onboarding, grocery sourcing, and replenishment execution searches without pretending OBAOL is an official representative of any marketplace.
                </p>
              </div>
              <div className="grid gap-3">
                {seoTargets.map((target) => (
                  <div key={target} className="rounded-xl border border-foreground/10 bg-background px-5 py-4 text-sm font-bold text-foreground/78">
                    {target}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-20 public-standard-section">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-obaol-700 dark:text-obaol-300">
              Make the process easier
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
              Give your procurement team one structured path from sourcing to dispatch.
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-foreground/65">
              Use OBAOL to organize supplier discovery, verification, operational ownership, documentation, logistics coordination, and repeat procurement flows for quick commerce supply chains.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/auth"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-obaol-300/40 bg-obaol-500 px-6 py-3 text-sm font-black text-obaol-950 transition-all hover:-translate-y-0.5 hover:bg-obaol-400"
              >
                Create your OBAOL workflow <FiArrowRight />
              </Link>
              <Link
                href="/procurement"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-foreground/15 px-6 py-3 text-sm font-bold text-foreground/80 transition-all hover:bg-foreground/[0.06]"
              >
                Explore procurement support
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </section>
  );
}
