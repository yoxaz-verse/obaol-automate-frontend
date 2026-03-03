import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";

const BASE_URL = "https://obaol.com";

const faqItems = [
  {
    q: "Is OBAOL Developer Mode free to start?",
    a: "Yes. You can sign in, generate API keys, and begin testing integrations. Usage and limits may be adjusted based on product policy updates.",
  },
  {
    q: "How do I generate an API key?",
    a: "Sign in with Google, open Developer Keys, create a key label, and copy the secret once. Use it as a Bearer token in your automation tool.",
  },
  {
    q: "Can I use this with n8n?",
    a: "Yes. Use the HTTP Request node, pass Authorization: Bearer <YOUR_API_KEY>, and call OBAOL endpoints like /v1/products/live.",
  },
  {
    q: "Can I use this for MCP and ChatGPT app connectors?",
    a: "Yes. Developer Mode is designed to provide stable API-key based access suitable for MCP tooling and custom connector flows.",
  },
  {
    q: "How are API keys secured?",
    a: "Raw keys are shown once on creation, stored as hashes server-side, and can be revoked immediately from Developer Keys.",
  },
  {
    q: "What happens when a key is revoked?",
    a: "Revoked keys are blocked instantly. Requests using revoked keys return authentication errors and no longer consume active usage quotas.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "OBAOL Developer APIs",
  url: `${BASE_URL}/developer`,
  description:
    "Build agri-trade automations with OBAOL developer APIs for live products, catalog sync, and workflow integrations with n8n, MCP, and ChatGPT connectors.",
};

export const metadata: Metadata = {
  title: "OBAOL Developer APIs for Agri Trade Automation",
  description:
    "Use OBAOL Developer Mode to run outreach, capture enquiries and orders through automation, and connect your workflows with n8n, MCP, and ChatGPT app integrations.",
  keywords: [
    "OBAOL developer API",
    "agri trade API",
    "export automation API",
    "n8n integration API",
    "MCP connector API",
    "ChatGPT app connector API",
    "commodity product API",
  ],
  alternates: {
    canonical: `${BASE_URL}/developer`,
  },
  openGraph: {
    title: "OBAOL Developer APIs for Agri Trade Automation",
    description:
      "Generate API keys and connect OBAOL APIs to n8n, MCP, and ChatGPT app connectors.",
    url: `${BASE_URL}/developer`,
    siteName: "OBAOL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OBAOL Developer APIs for Agri Trade Automation",
    description:
      "Build automations and integrations using OBAOL developer APIs.",
  },
};

const buildCards = [
  "Outreach automation pipelines for email, forms, and chat",
  "Real-time product and pricing based response systems",
  "Automatic enquiry capture and routing into your workflow",
  "Order-intent tracking and handoff automation",
  "MCP and ChatGPT connector-based sales assistants",
];

const earnItems = [
  "Offer outreach automation setups to businesses using OBAOL APIs",
  "Build done-for-you systems that capture leads, enquiries, and order requests",
  "Charge for integration, workflow maintenance, and optimization retainers",
  "Let OBAOL handle downstream trade flow while you focus on automation outcomes",
];

const howItWorks = [
  "Sign in with Google",
  "Generate API key in Developer Keys",
  "Connect n8n, MCP, or ChatGPT app integrations",
  "Monitor usage and rotate/revoke keys as needed",
];

export default function DeveloperIndexPage() {
  return (
    <main className="min-h-screen bg-default-50 dark:bg-[#07090f]">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="mx-auto max-w-6xl rounded-2xl border border-default-200 dark:border-white/15 bg-white dark:bg-[#11151f] p-8 md:p-10 shadow-sm dark:shadow-none mt-24 px-4">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-default-900 dark:text-white">
            OBAOL Developer APIs for Agri Trade Automation
          </h1>
          <p className="mt-4 text-base text-default-700 dark:text-white/80">
            Use automation to run outreach, capture enquiries, and route order intent at scale. OBAOL APIs help automators and operators plug n8n, MCP, and ChatGPT-based workflows into one execution-ready pipeline.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/developer/login"
              className="inline-flex items-center rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Continue with Google
            </Link>
            <a
              href="#api-capabilities"
              className="inline-flex items-center rounded-xl border border-default-300 dark:border-white/25 px-5 py-2.5 text-sm font-semibold text-default-800 dark:text-white hover:bg-default-100 dark:hover:bg-white/10"
            >
              Explore API Link & Capabilities
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-6xl grid gap-6 md:grid-cols-2 xl:grid-cols-3 px-4">
        <article className="rounded-2xl border border-default-200 dark:border-white/15 bg-white dark:bg-[#11151f] p-6">
          <h2 className="text-lg font-semibold text-default-900 dark:text-white">What You Can Build</h2>
          <ul className="mt-4 space-y-2 text-sm text-default-700 dark:text-white/80">
            {buildCards.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-default-200 dark:border-white/15 bg-white dark:bg-[#11151f] p-6">
          <h2 className="text-lg font-semibold text-default-900 dark:text-white">How Developers Earn</h2>
          <p className="mt-2 text-xs text-default-500 dark:text-white/60">
            Service-model examples only. No income guarantees.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-default-700 dark:text-white/80">
            {earnItems.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-default-200 dark:border-white/15 bg-white dark:bg-[#11151f] p-6">
          <h2 className="text-lg font-semibold text-default-900 dark:text-white">How It Works</h2>
          <ol className="mt-4 space-y-2 text-sm text-default-700 dark:text-white/80">
            {howItWorks.map((item, index) => (
              <li key={item}>{index + 1}. {item}</li>
            ))}
          </ol>
        </article>
      </section>

      <section
        id="api-capabilities"
        className="mx-auto mt-8 max-w-6xl rounded-2xl border border-default-200 dark:border-white/15 bg-white dark:bg-[#11151f] p-6 md:p-8 px-4"
      >
        <h2 className="text-xl font-semibold text-default-900 dark:text-white">API Capability Snapshot</h2>
        <div className="mt-4 rounded-xl border border-default-200 dark:border-white/15 bg-default-50 dark:bg-[#0c1118] p-4">
          <p className="text-xs uppercase tracking-wider text-default-500 dark:text-white/65">Base URL</p>
          <a
            href="https://api.obaol.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block font-mono text-sm text-primary-500 hover:underline"
          >
            https://api.obaol.com
          </a>
          <p className="mt-2 text-xs text-default-600 dark:text-white/70">
            Use this base URL in n8n, MCP tools, ChatGPT connectors, and custom apps.
          </p>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-default-200 dark:border-white/15 text-default-700 dark:text-white/85">
                <th className="py-2 pr-4">Endpoint</th>
                <th className="py-2 pr-4">Purpose</th>
                <th className="py-2">Access</th>
              </tr>
            </thead>
            <tbody className="text-default-700 dark:text-white/80">
              <tr className="border-b border-default-100 dark:border-white/10">
                <td className="py-3 pr-4 font-mono">GET https://api.obaol.com/v1/products/live</td>
                <td className="py-3 pr-4">Use live product signals in outreach and automation flows</td>
                <td className="py-3">API key required</td>
              </tr>
              <tr className="border-b border-default-100 dark:border-white/10">
                <td className="py-3 pr-4 font-mono">GET https://api.obaol.com/v1/products/all</td>
                <td className="py-3 pr-4">Build full catalog and matching automations</td>
                <td className="py-3">API key required</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-mono">Authorization Header</td>
                <td className="py-3 pr-4">Use Bearer API key for all requests</td>
                <td className="py-3 font-mono">Bearer &lt;API_KEY&gt;</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-5 rounded-xl border border-default-200 dark:border-white/15 p-4">
          <p className="text-xs uppercase tracking-wider text-default-500 dark:text-white/65">Quick cURL</p>
          <pre className="mt-2 overflow-x-auto text-xs md:text-sm text-default-800 dark:text-white/85">
            {`curl -X GET "https://api.obaol.com/v1/products/live" \\
  -H "Authorization: Bearer <API_KEY>"`}
          </pre>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/developer/login"
            className="inline-flex items-center rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Sign In to Generate API Key
          </Link>
          <Link
            href="/developer/usage"
            className="inline-flex items-center rounded-xl border border-default-300 dark:border-white/25 px-5 py-2.5 text-sm font-semibold text-default-800 dark:text-white hover:bg-default-100 dark:hover:bg-white/10"
          >
            View Usage Interface
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-8 mb-12 max-w-6xl rounded-2xl border border-default-200 dark:border-white/15 bg-white dark:bg-[#11151f] p-6 md:p-8 px-4">
        <h2 className="text-xl font-semibold text-default-900 dark:text-white">Developer FAQ</h2>
        <p className="mt-2 text-sm text-default-600 dark:text-white/75">
          Run your own outreach and automation stack, and use OBAOL APIs as the core product and trade data layer.
        </p>
        <div className="mt-4 space-y-4">
          {faqItems.map((item) => (
            <article key={item.q} className="rounded-xl border border-default-200 dark:border-white/15 p-4">
              <h3 className="text-sm font-semibold text-default-900 dark:text-white">{item.q}</h3>
              <p className="mt-1 text-sm text-default-700 dark:text-white/80">{item.a}</p>
            </article>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
