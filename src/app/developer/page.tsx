"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FiActivity, FiArrowRight, FiBox, FiCpu, FiDatabase, FiGrid } from "react-icons/fi";
import { developerHealth, publicDeveloperFetch } from "@/utils/developerApi";

type Summary = { liveProductCount: number; liveListingCount: number; liveLabCount: number; mcpToolCount: number; generatedAt: string };

export default function DeveloperIndexPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [health, setHealth] = useState({ api: false, mcp: false });
  const [error, setError] = useState("");
  useEffect(() => { Promise.all([publicDeveloperFetch("/catalog/summary"), developerHealth()]).then(([catalog, checks]) => { setSummary(catalog.data); setHealth({ api: checks[0].status === "fulfilled", mcp: checks[1].status === "fulfilled" }); }).catch((e) => setError(e?.message || "Live developer data is temporarily unavailable.")); }, []);
  const metrics = [["Live products", summary?.liveProductCount, FiBox], ["Live listings", summary?.liveListingCount, FiGrid], ["Published labs", summary?.liveLabCount, FiDatabase], ["MCP tools", summary?.mcpToolCount, FiCpu]] as const;
  return <main className="min-h-screen bg-default-50 text-foreground dark:bg-brand-abyssal"><section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
    <div className="grid gap-8 rounded-3xl border border-default-200 bg-white p-7 shadow-sm dark:border-white/15 dark:bg-brand-blue md:grid-cols-[1.2fr_.8fr] md:p-12"><div>
      <p className="text-xs font-black uppercase tracking-[.2em] text-obaol-700 dark:text-obaol-300">OBAOL Developer Platform</p><h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight text-default-900 dark:text-white md:text-6xl">Build with live trade intelligence.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-default-600 dark:text-white/75">Discover live products and published quality labs, connect AI assistants through MCP, and automate enquiries with scoped APIs.</p>
      <div className="mt-8 flex flex-wrap gap-3"><Link href="/developer/catalog" className="inline-flex items-center gap-2 rounded-xl bg-obaol-500 px-5 py-3 font-black text-black">Explore live catalog <FiArrowRight /></Link><Link href="/developer/login" className="rounded-xl border border-default-300 px-5 py-3 font-bold dark:border-white/25">Create API key</Link></div>
    </div><div className="rounded-2xl bg-brand-abyssal p-6 text-white"><p className="font-mono text-sm text-obaol-300">https://api.obaol.com</p><h2 className="mt-5 text-xl font-black">Service status</h2><div className="mt-4 space-y-3"><Status label="Developer API" ready={health.api} /><Status label="MCP connector" ready={health.mcp} /></div><p className="mt-6 text-sm text-white/60">Bearer API keys for REST. Revocable connector tokens for MCP clients.</p></div></div>
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{metrics.map(([label, value, Icon]) => <article key={label} className="rounded-2xl border border-default-200 bg-white p-5 dark:border-white/15 dark:bg-brand-blue"><Icon className="text-obaol-600" /><p className="mt-5 text-3xl font-black">{value ?? "—"}</p><p className="mt-1 text-sm font-bold text-default-500 dark:text-white/60">{label}</p></article>)}</div>{error ? <p role="alert" className="mt-5 rounded-xl border border-danger-300 bg-danger-50 p-4 text-danger-700">{error}</p> : null}
    <section className="mt-10 grid gap-5 md:grid-cols-3"><Feature title="Browse the catalog" text="Search public-safe live product listings and lab capabilities, then continue on OBAOL." href="/developer/catalog" /><Feature title="Integrate your stack" text="Copy setup for ChatGPT, Claude, Cursor, VS Code, n8n, or any MCP client." href="/developer/integrations" /><Feature title="Build against the API" text="Review permissions, request schemas, responses, examples, and errors." href="/developer/api" /></section>
  </section></main>;
}
function Status({ label, ready }: { label: string; ready: boolean }) { return <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3"><span className="flex items-center gap-2"><FiActivity />{label}</span><span className={ready ? "text-success-300" : "text-warning-300"}>{ready ? "Operational" : "Checking"}</span></div>; }
function Feature({ title, text, href }: { title: string; text: string; href: string }) { return <Link href={href} className="rounded-2xl border border-default-200 bg-white p-6 transition hover:-translate-y-1 hover:border-obaol-400 dark:border-white/15 dark:bg-brand-blue"><h2 className="text-xl font-black">{title}</h2><p className="mt-3 text-sm leading-6 text-default-600 dark:text-white/70">{text}</p><span className="mt-5 inline-flex items-center gap-2 font-bold text-primary-500">Open <FiArrowRight /></span></Link>; }
