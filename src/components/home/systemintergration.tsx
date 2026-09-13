"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowRight, FiBookOpen, FiKey, FiTerminal } from "react-icons/fi";

const documentationItems = [
  {
    title: "Authentication",
    description: "Generate Bearer API keys, create connector tokens, and revoke access from the developer console.",
    meta: "API keys",
    icon: <FiKey aria-hidden="true" />,
  },
  {
    title: "Endpoint Reference",
    description: "Use live products, prices, verified traders, enquiries, and CIF calculation routes in automation flows.",
    meta: "REST APIs",
    icon: <FiTerminal aria-hidden="true" />,
  },
  {
    title: "MCP Setup",
    description: "Connect OBAOL to ChatGPT app connectors and MCP-based workflow tools through secure connector URLs.",
    meta: "Connectors",
    icon: <FiBookOpen aria-hidden="true" />,
  },
];

const referenceRows = [
  ["GET", "/v1/products/live", "Live trade-ready products"],
  ["POST", "/v1/inquiries", "Capture enquiry intent"],
  ["POST", "/v1/calculate/cif", "Run CIF calculations"],
];

export default function SystemIntergrationSection() {
  return (
    <section className="relative overflow-hidden border-t border-default-200 bg-background px-6 py-20 md:py-28 public-standard-section">
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] dark:opacity-[0.055] bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-[size:44px_44px] public-decoration" />
      <div className="mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="grid items-start gap-12 lg:grid-cols-[0.95fr_1.05fr]"
        >
          <div className="max-w-2xl">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-obaol-700 dark:text-obaol-300">
              Developer Documentation
            </span>
            <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
              Build trade automations on top of OBAOL.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-foreground/70 md:text-lg">
              The documentation now brings API keys, endpoint usage, MCP connector setup, and usage monitoring into one developer-facing path for agri-trade automation.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-foreground/55 md:text-base">
              Use live product data, pricing, verified trader signals, enquiry capture, and CIF calculation routes in n8n, ChatGPT connectors, MCP tools, or custom internal systems. Webhook-style automation is positioned as an enterprise workflow capability where available.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/developer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-obaol-500 px-5 py-3 text-sm font-black text-obaol-950 transition hover:bg-obaol-400"
              >
                Open Documentation
                <FiArrowRight aria-hidden="true" />
              </Link>
              <Link
                href="/developer/login"
                className="inline-flex items-center justify-center rounded-lg border border-default-300 px-5 py-3 text-sm font-bold text-foreground transition hover:border-obaol-400 hover:bg-obaol-500/10 dark:border-white/20"
              >
                Generate API Key
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-default-200 bg-content1 p-5 shadow-[0_18px_60px_-44px_rgba(0,0,0,0.65)] dark:border-white/15">
              <div className="flex items-center justify-between gap-4 border-b border-default-200 pb-4 dark:border-white/10">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-default-500">Docs Preview</p>
                  <h3 className="mt-1 text-lg font-black text-foreground">API reference at a glance</h3>
                </div>
                <code className="rounded-md border border-default-200 bg-default-50 px-3 py-1.5 text-xs font-bold text-default-700 dark:border-white/15 dark:bg-white/5 dark:text-white/80">
                  api.obaol.com
                </code>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <tbody>
                    {referenceRows.map(([method, path, purpose]) => (
                      <tr key={path} className="border-b border-default-100 last:border-0 dark:border-white/10">
                        <td className="py-3 pr-3">
                          <span className="rounded-md bg-obaol-500/10 px-2 py-1 font-mono text-xs font-black text-obaol-700 dark:text-obaol-300">
                            {method}
                          </span>
                        </td>
                        <td className="py-3 pr-3 font-mono text-xs font-semibold text-foreground">{path}</td>
                        <td className="py-3 text-xs text-foreground/60">{purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {documentationItems.map((item) => (
                <article key={item.title} className="rounded-lg border border-default-200 bg-content1 p-4 dark:border-white/15">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-obaol-500/10 text-obaol-700 dark:text-obaol-300">
                    {item.icon}
                  </div>
                  <p className="mt-4 text-[10px] font-black uppercase tracking-[0.16em] text-default-400">{item.meta}</p>
                  <h3 className="mt-1 text-sm font-black text-foreground">{item.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-foreground/60">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
