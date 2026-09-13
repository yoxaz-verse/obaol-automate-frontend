import type { Metadata } from "next";
import Link from "next/link";
import {
  FiActivity,
  FiArrowRight,
  FiBookOpen,
  FiCheckCircle,
  FiCpu,
  FiKey,
  FiLock,
  FiRefreshCw,
  FiShield,
  FiTerminal,
} from "react-icons/fi";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";

const BASE_URL = "https://obaol.com";
const API_BASE_URL = "https://api.obaol.com";

const overviewCards = [
  {
    title: "API keys",
    description: "Create scoped keys, use them as Bearer tokens, rotate access, and revoke compromised keys immediately.",
    icon: FiKey,
  },
  {
    title: "Trade data APIs",
    description: "Read products, prices, and verified trader signals, then capture enquiry intent from external workflows.",
    icon: FiTerminal,
  },
  {
    title: "MCP connectors",
    description: "Create connector tokens for ChatGPT app connectors and MCP-based assistants without exposing your raw API key.",
    icon: FiCpu,
  },
  {
    title: "Usage controls",
    description: "Monitor request volume, top routes, per-key activity, status codes, and rate-limit behavior.",
    icon: FiActivity,
  },
];

const quickStartSteps = [
  {
    title: "Sign in to Developer Mode",
    description: "Use Google sign-in to create or access your developer profile.",
    href: "/developer/login",
    cta: "Open login",
  },
  {
    title: "Generate an API key",
    description: "Create a labeled key, choose a permission preset, and copy the raw key once when it is shown.",
    href: "/developer/keys",
    cta: "Manage keys",
  },
  {
    title: "Call an endpoint",
    description: "Send Authorization: Bearer <API_KEY> with every protected business API request.",
    href: "#code-examples",
    cta: "View example",
  },
  {
    title: "Monitor and rotate",
    description: "Track usage by route and key, revoke keys that are no longer needed, and create replacement keys when required.",
    href: "/developer/usage",
    cta: "View usage",
  },
];

const endpoints = [
  {
    method: "GET",
    path: "/v1/products/live",
    permission: "products:read",
    purpose: "Return live trade-ready product signals.",
    notes: "Optional query: associateCompany, page, limit.",
  },
  {
    method: "GET",
    path: "/v1/products/all",
    permission: "products:read",
    purpose: "Return the full product catalog for catalog sync and matching.",
    notes: "Optional query: associateCompany, page, limit.",
  },
  {
    method: "GET",
    path: "/v1/prices",
    permission: "prices:read",
    purpose: "Return commodity price data for response and pricing workflows.",
    notes: "Optional query: commodity.",
  },
  {
    method: "GET",
    path: "/v1/traders",
    permission: "traders:read",
    purpose: "Return trader records for discovery and verification-aware workflows.",
    notes: "Optional query: verified=true.",
  },
  {
    method: "POST",
    path: "/v1/inquiries",
    permission: "inquiries:create",
    purpose: "Create an enquiry from an external form, chat, CRM, or automation workflow.",
    notes: "JSON request body.",
  },
  {
    method: "POST",
    path: "/v1/calculate/cif",
    permission: "calculator:use",
    purpose: "Calculate CIF values for trade estimation workflows.",
    notes: "JSON request body.",
  },
];

const permissionPresets = [
  {
    name: "read_only",
    permissions: "prices:read, traders:read, products:read",
    description: "Best for dashboards, catalog syncs, and read-only automation.",
  },
  {
    name: "automation_basic",
    permissions: "prices:read, traders:read, products:read, inquiries:create, calculator:use",
    description: "Default preset for lead capture, product lookup, and calculation workflows.",
  },
  {
    name: "full_api",
    permissions: "*",
    description: "Restricted by server policy and only available when explicitly enabled.",
  },
];

const codeExamples = [
  {
    title: "Read live products",
    language: "bash",
    code: `curl -X GET "${API_BASE_URL}/v1/products/live?page=1&limit=20" \\
  -H "Authorization: Bearer <API_KEY>"`,
  },
  {
    title: "Create an enquiry",
    language: "bash",
    code: `curl -X POST "${API_BASE_URL}/v1/inquiries" \\
  -H "Authorization: Bearer <API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "product": "Turmeric",
    "quantity": 25,
    "buyerName": "Example Buyer"
  }'`,
  },
  {
    title: "Use a connector token",
    language: "text",
    code: `${API_BASE_URL}/mcp?connectorToken=<CONNECTOR_TOKEN>`,
  },
];

const securityNotes = [
  "Raw API keys are shown once when created. Store them in a secret manager or automation credential vault.",
  "API keys are stored as hashes server-side and cannot be recovered after creation.",
  "Revoked API keys and revoked connector tokens are blocked immediately.",
  "Every business API request must include Authorization: Bearer <API_KEY> unless you are using a connector-token flow.",
  "Per-key rate limits are bounded by platform policy and can be monitored from the usage interface.",
];

const mcpSteps = [
  "Create an active API key from Developer Keys.",
  "Create a ChatGPT Connector token linked to that API key.",
  "Use the generated MCP Server URL in your ChatGPT app connector or MCP-compatible tool.",
  "Set authentication mode to No Auth because the connector token is already embedded in the URL.",
  "Use /mcp/info and /mcp/health for connector status checks.",
];

const faqItems = [
  {
    q: "Is OBAOL Developer Mode free to start?",
    a: "Yes. You can sign in, generate API keys, and begin testing integrations. Usage and limits may be adjusted based on product policy updates.",
  },
  {
    q: "How do I generate an API key?",
    a: "Sign in with Google, open Developer Keys, create a key label, choose a preset, and copy the secret once.",
  },
  {
    q: "Can I use this with n8n?",
    a: "Yes. Use the HTTP Request node, pass Authorization: Bearer <API_KEY>, and call OBAOL endpoints such as /v1/products/live.",
  },
  {
    q: "Can I use this for MCP and ChatGPT app connectors?",
    a: "Yes. Create a connector token in Developer Keys and use the generated MCP URL in ChatGPT app connector setup.",
  },
  {
    q: "Why does /mcp look blank in a browser?",
    a: "The /mcp endpoint is an SSE stream endpoint for tools and connectors, so direct browser navigation may not show a normal page.",
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
  name: "OBAOL Developer Documentation",
  url: `${BASE_URL}/developer`,
  description:
    "Developer documentation for OBAOL agri-trade APIs, API keys, MCP connectors, endpoint reference, and automation workflows.",
};

export const metadata: Metadata = {
  title: "OBAOL Developer Documentation and API Reference",
  description:
    "Use OBAOL Developer Mode to generate API keys, call agri-trade endpoints, set up MCP connectors, and monitor automation usage.",
  keywords: [
    "OBAOL developer documentation",
    "OBAOL API reference",
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
    title: "OBAOL Developer Documentation and API Reference",
    description:
      "Generate API keys, call OBAOL APIs, connect MCP tools, and monitor developer usage.",
    url: `${BASE_URL}/developer`,
    siteName: "OBAOL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OBAOL Developer Documentation and API Reference",
    description:
      "Build agri-trade automations using OBAOL developer APIs and connector tokens.",
  },
};

export default function DeveloperIndexPage() {
  return (
    <main className="min-h-screen bg-default-50 text-foreground dark:bg-[#07090f]">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="mx-auto max-w-6xl px-4 pt-24 md:pt-28">
        <div className="grid gap-8 rounded-lg border border-default-200 bg-white p-6 shadow-sm dark:border-white/15 dark:bg-[#11151f] md:grid-cols-[1.05fr_0.95fr] md:p-10">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-obaol-700 dark:text-obaol-300">
              Developer Documentation
            </p>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-default-900 dark:text-white md:text-5xl">
              OBAOL APIs for agri-trade automation.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-default-700 dark:text-white/78 md:text-lg">
              Generate API keys, connect MCP tools, read live trade data, capture enquiries, and monitor usage from one developer workflow.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/developer/login"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-obaol-500 px-5 py-3 text-sm font-black text-obaol-950 transition hover:bg-obaol-400"
              >
                Start with Google
                <FiArrowRight aria-hidden="true" />
              </Link>
              <a
                href="#endpoint-reference"
                className="inline-flex items-center justify-center rounded-lg border border-default-300 px-5 py-3 text-sm font-bold text-default-800 transition hover:border-obaol-400 hover:bg-obaol-500/10 dark:border-white/25 dark:text-white"
              >
                View endpoint reference
              </a>
            </div>
          </div>

          <div className="rounded-lg border border-default-200 bg-default-50 p-5 dark:border-white/15 dark:bg-[#0c1118]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-default-500 dark:text-white/60">
              API Base URL
            </p>
            <a
              href={API_BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block break-all font-mono text-sm font-bold text-primary-500 hover:underline md:text-base"
            >
              {API_BASE_URL}
            </a>
            <dl className="mt-6 grid gap-4 text-sm">
              <div>
                <dt className="font-bold text-default-900 dark:text-white">Authentication</dt>
                <dd className="mt-1 text-default-600 dark:text-white/70">Authorization: Bearer &lt;API_KEY&gt;</dd>
              </div>
              <div>
                <dt className="font-bold text-default-900 dark:text-white">Default key preset</dt>
                <dd className="mt-1 text-default-600 dark:text-white/70">automation_basic</dd>
              </div>
              <div>
                <dt className="font-bold text-default-900 dark:text-white">Connector model</dt>
                <dd className="mt-1 text-default-600 dark:text-white/70">MCP connector token linked to an active API key</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 grid max-w-6xl gap-4 px-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.title} className="rounded-lg border border-default-200 bg-white p-5 dark:border-white/15 dark:bg-[#11151f]">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-obaol-500/10 text-obaol-700 dark:text-obaol-300">
                <Icon aria-hidden="true" />
              </div>
              <h2 className="mt-4 text-base font-black text-default-900 dark:text-white">{card.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-default-600 dark:text-white/72">{card.description}</p>
            </article>
          );
        })}
      </section>

      <section id="quick-start" className="mx-auto mt-8 max-w-6xl px-4">
        <div className="rounded-lg border border-default-200 bg-white p-6 dark:border-white/15 dark:bg-[#11151f] md:p-8">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-default-500 dark:text-white/60">Quick Start</p>
              <h2 className="mt-2 text-2xl font-black text-default-900 dark:text-white">From login to first request</h2>
            </div>
            <Link href="/developer/keys" className="text-sm font-bold text-primary-500 hover:underline">
              Open Developer Keys
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {quickStartSteps.map((step, index) => (
              <article key={step.title} className="rounded-lg border border-default-200 p-4 dark:border-white/15">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-obaol-500 text-sm font-black text-obaol-950">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-sm font-black text-default-900 dark:text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-default-600 dark:text-white/72">{step.description}</p>
                <Link href={step.href} className="mt-4 inline-flex text-sm font-bold text-primary-500 hover:underline">
                  {step.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="endpoint-reference" className="mx-auto mt-8 max-w-6xl px-4">
        <div className="rounded-lg border border-default-200 bg-white p-6 dark:border-white/15 dark:bg-[#11151f] md:p-8">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-default-500 dark:text-white/60">Endpoint Reference</p>
            <h2 className="mt-2 text-2xl font-black text-default-900 dark:text-white">Protected business APIs</h2>
            <p className="mt-3 text-sm leading-relaxed text-default-600 dark:text-white/72">
              These routes require an active API key and the listed permission. Responses use JSON with success and data fields, with pagination metadata where the route supports it.
            </p>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr className="border-b border-default-200 text-default-600 dark:border-white/15 dark:text-white/70">
                  <th className="py-3 pr-4">Method</th>
                  <th className="py-3 pr-4">Endpoint</th>
                  <th className="py-3 pr-4">Permission</th>
                  <th className="py-3 pr-4">Purpose</th>
                  <th className="py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="text-default-700 dark:text-white/82">
                {endpoints.map((endpoint) => (
                  <tr key={endpoint.path} className="border-b border-default-100 last:border-0 dark:border-white/10">
                    <td className="py-4 pr-4">
                      <span className="rounded-md bg-default-100 px-2 py-1 font-mono text-xs font-black text-default-700 dark:bg-white/10 dark:text-white">
                        {endpoint.method}
                      </span>
                    </td>
                    <td className="py-4 pr-4 font-mono text-xs font-bold text-default-900 dark:text-white">
                      {endpoint.path}
                    </td>
                    <td className="py-4 pr-4 font-mono text-xs">{endpoint.permission}</td>
                    <td className="py-4 pr-4">{endpoint.purpose}</td>
                    <td className="py-4 text-default-500 dark:text-white/62">{endpoint.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="code-examples" className="mx-auto mt-8 grid max-w-6xl gap-4 px-4 lg:grid-cols-3">
        {codeExamples.map((example) => (
          <article key={example.title} className="rounded-lg border border-default-200 bg-white p-5 dark:border-white/15 dark:bg-[#11151f]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-black text-default-900 dark:text-white">{example.title}</h2>
              <span className="rounded-md bg-default-100 px-2 py-1 text-xs font-bold text-default-500 dark:bg-white/10 dark:text-white/60">
                {example.language}
              </span>
            </div>
            <pre className="mt-4 overflow-x-auto rounded-lg bg-default-950 p-4 text-xs leading-relaxed text-default-50">
              <code>{example.code}</code>
            </pre>
          </article>
        ))}
      </section>

      <section id="authentication" className="mx-auto mt-8 max-w-6xl px-4">
        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-lg border border-default-200 bg-white p-6 dark:border-white/15 dark:bg-[#11151f] md:p-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-obaol-500/10 text-obaol-700 dark:text-obaol-300">
              <FiShield aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-2xl font-black text-default-900 dark:text-white">Authentication and security</h2>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-default-600 dark:text-white/74">
              {securityNotes.map((note) => (
                <li key={note} className="flex gap-3">
                  <FiCheckCircle className="mt-0.5 shrink-0 text-obaol-600 dark:text-obaol-300" aria-hidden="true" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-default-200 bg-white p-6 dark:border-white/15 dark:bg-[#11151f] md:p-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-obaol-500/10 text-obaol-700 dark:text-obaol-300">
              <FiLock aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-2xl font-black text-default-900 dark:text-white">Permission presets</h2>
            <div className="mt-5 space-y-3">
              {permissionPresets.map((preset) => (
                <article key={preset.name} className="rounded-lg border border-default-200 p-4 dark:border-white/15">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <h3 className="font-mono text-sm font-black text-default-900 dark:text-white">{preset.name}</h3>
                    <code className="break-words text-xs text-default-500 dark:text-white/60">{preset.permissions}</code>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-default-600 dark:text-white/72">{preset.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="mcp-setup" className="mx-auto mt-8 max-w-6xl px-4">
        <div className="grid gap-6 rounded-lg border border-default-200 bg-white p-6 dark:border-white/15 dark:bg-[#11151f] md:p-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-default-500 dark:text-white/60">MCP / ChatGPT Connector Setup</p>
            <h2 className="mt-2 text-2xl font-black text-default-900 dark:text-white">Connect tools without sharing raw keys</h2>
            <p className="mt-3 text-sm leading-relaxed text-default-600 dark:text-white/72">
              Connector tokens map back to active API keys and can be revoked independently. Use them for ChatGPT app connectors and MCP-compatible tools that need an SSE server URL.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/developer/keys"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-obaol-500 px-5 py-3 text-sm font-black text-obaol-950 transition hover:bg-obaol-400"
              >
                Create connector token
                <FiRefreshCw aria-hidden="true" />
              </Link>
              <Link
                href="/developer/usage"
                className="inline-flex items-center justify-center rounded-lg border border-default-300 px-5 py-3 text-sm font-bold text-default-800 transition hover:border-obaol-400 hover:bg-obaol-500/10 dark:border-white/25 dark:text-white"
              >
                Monitor usage
              </Link>
            </div>
          </div>
          <ol className="space-y-3">
            {mcpSteps.map((step, index) => (
              <li key={step} className="flex gap-3 rounded-lg border border-default-200 p-4 text-sm text-default-700 dark:border-white/15 dark:text-white/78">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-default-100 text-xs font-black text-default-700 dark:bg-white/10 dark:text-white">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="faq" className="mx-auto mb-12 mt-8 max-w-6xl px-4">
        <div className="rounded-lg border border-default-200 bg-white p-6 dark:border-white/15 dark:bg-[#11151f] md:p-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-obaol-500/10 text-obaol-700 dark:text-obaol-300">
            <FiBookOpen aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-2xl font-black text-default-900 dark:text-white">Developer FAQ</h2>
          <p className="mt-2 text-sm leading-relaxed text-default-600 dark:text-white/72">
            Common questions for developers building outreach systems, internal dashboards, connector tools, and trade automation workflows.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {faqItems.map((item) => (
              <article key={item.q} className="rounded-lg border border-default-200 p-4 dark:border-white/15">
                <h3 className="text-sm font-black text-default-900 dark:text-white">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-default-600 dark:text-white/72">{item.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
