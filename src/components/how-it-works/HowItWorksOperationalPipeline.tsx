import Link from "next/link";
import { FiActivity, FiArrowRight, FiCheckCircle, FiClipboard, FiCode, FiFileText, FiFlag, FiPackage, FiSearch, FiShield, FiTruck, FiUsers } from "react-icons/fi";

const stages = [
  ["01", "Discover", "Define the commodity, quantity, destination, timeline, and the counterparties needed to execute.", "Requirements and matched supply", FiSearch],
  ["02", "Verify", "Confirm identity, capability, stock, samples, and readiness before commitments become expensive.", "Counterparty and stock checks", FiShield],
  ["03", "Document", "Keep specifications, commercial terms, approvals, and trade documents in one operating context.", "Aligned terms and records", FiFileText],
  ["04", "Procure", "Coordinate on-ground sourcing, quality checks, packaging, warehousing, and accountable handoffs.", "Physical execution support", FiPackage],
  ["05", "Move", "Connect inland transport, freight, customs, milestones, and exceptions to the same trade record.", "Logistics and clearance", FiTruck],
  ["06", "Close", "Track buyer receipt, approvals, settlement conditions, and unresolved gaps through completion.", "Delivery and settlement", FiFlag],
] as const;

const comparisons = [
  ["Supplier discovery", "Scattered searches and references", "Requirements matched to relevant supply"],
  ["Verification", "Self-declared or performed too late", "Identity, capability, stock, and readiness checks"],
  ["Documentation", "Files and decisions split across channels", "Shared terms, evidence, approvals, and ownership"],
  ["Procurement", "Travel and local coordination arranged ad hoc", "On-ground partners connected to the active workflow"],
  ["Logistics", "Movement updates detached from the deal", "Transport, freight, customs, and milestones stay linked"],
  ["Settlement", "Closure depends on manual follow-up", "Receipt, conditions, exceptions, and completion remain visible"],
] as const;

const safeguards = [
  ["Genuine intent", "Readiness is established before participants invest weeks in non-converging conversations.", FiUsers],
  ["Visible ownership", "Every document, check, milestone, and exception has context and an accountable handoff.", FiClipboard],
  ["Execution continuity", "The operating record stays intact from the first requirement through delivery and settlement.", FiActivity],
] as const;

export default function HowItWorksOperationalPipeline() {
  return (
    <div className="how-it-works-page overflow-hidden">
      <section className="relative border-b border-[var(--public-border)] py-12 sm:py-16 lg:py-20">
        <div className="public-layout-container relative z-10">
          <div className="max-w-4xl">
            <p className="public-eyebrow">How OBAOL works</p>
            <h1 className="mt-4 max-w-[17ch] text-[clamp(2.4rem,6vw,4.75rem)] font-extrabold leading-[1.02] tracking-[-0.055em] text-[var(--public-text)] text-balance">Trade execution, explained by process.</h1>
            <p className="mt-6 max-w-3xl text-base font-medium leading-8 text-[var(--public-muted)] sm:text-lg">OBAOL connects discovery, verification, documents, procurement, logistics, and settlement in one visible operating flow. The platform does not replace specialist partners; it gives every participant clear context, ownership, and handoffs.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#workflow" className="public-button public-button--primary">Explore the workflow <FiArrowRight aria-hidden="true" /></Link>
              <Link href="/roles" className="public-button public-button--secondary">See platform roles</Link>
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="scroll-mt-28 py-12 sm:py-16 lg:py-20">
        <div className="public-layout-container">
          <div className="public-section-heading">
            <p className="public-eyebrow">One operating flow</p>
            <h2 className="public-title">Six stages from requirement to closure</h2>
            <p className="public-description">Each stage produces the context the next participant needs, reducing repeated explanations and disconnected follow-up.</p>
          </div>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stages.map(([number, title, description, detail, Icon]) => (
              <li key={number} className="public-card flex min-w-0 flex-col">
                <div className="flex items-center justify-between gap-4"><span className="public-icon"><Icon aria-hidden="true" /></span><span className="text-xs font-bold tracking-[0.18em] text-[var(--public-muted)]">{number}</span></div>
                <h3 className="mt-6 text-xl font-extrabold tracking-tight text-[var(--public-text)]">{title}</h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-[var(--public-muted)]">{description}</p>
                <p className="mt-5 border-t border-[var(--public-border)] pt-4 text-xs font-bold uppercase tracking-[0.09em] text-[var(--public-accent)]">{detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-y border-[var(--public-border)] bg-[var(--public-surface)] py-12 sm:py-16 lg:py-20">
        <div className="public-layout-container">
          <div className="public-section-heading">
            <p className="public-eyebrow">Connected execution</p>
            <h2 className="public-title">Replace fragmented follow-up with visible progress</h2>
            <p className="public-description">The difference is not a promise to skip due diligence. It is a shared process that keeps the work and its evidence connected.</p>
          </div>
          <div className="mt-10 overflow-hidden rounded-[var(--public-card-radius)] border border-[var(--public-border)] bg-[var(--public-bg)]">
            <div className="hidden grid-cols-[minmax(9rem,.7fr)_minmax(0,1fr)_minmax(0,1fr)] border-b border-[var(--public-border)] px-6 py-4 text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--public-muted)] md:grid"><span>Stage</span><span>Traditional method</span><span className="text-[var(--public-accent)]">With OBAOL</span></div>
            {comparisons.map(([label, traditional, obaol]) => (
              <article key={label} className="grid gap-4 border-b border-[var(--public-border)] p-5 last:border-0 md:grid-cols-[minmax(9rem,.7fr)_minmax(0,1fr)_minmax(0,1fr)] md:gap-6 md:px-6">
                <h3 className="font-extrabold text-[var(--public-text)]">{label}</h3>
                <div><span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--public-muted)] md:hidden">Traditional</span><p className="text-sm leading-6 text-[var(--public-muted)]">{traditional}</p></div>
                <div><span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--public-accent)] md:hidden">With OBAOL</span><p className="flex gap-2 text-sm font-semibold leading-6 text-[var(--public-text)]"><FiCheckCircle aria-hidden="true" className="mt-1 shrink-0 text-[var(--public-success)]" />{obaol}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20">
        <div className="public-layout-container">
          <div className="rounded-[var(--public-card-radius)] bg-[var(--brand-abyssal)] p-6 text-[var(--brand-palladian)] sm:p-8 lg:p-10">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] lg:items-start">
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-flame)]">Integrity by design</p><h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">Filter noise early. Keep accountability visible.</h2><p className="mt-5 max-w-xl text-base leading-7 text-[#d8d1c5]">Execution failures often begin with unclear intent, incomplete checks, or ownership gaps. OBAOL brings those decisions into the workflow before they become expensive.</p></div>
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {safeguards.map(([title, description, Icon]) => <article key={title} className="rounded-xl border border-white/15 bg-white/[0.06] p-5"><Icon aria-hidden="true" className="text-xl text-[var(--brand-flame)]" /><h3 className="mt-4 font-extrabold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-[#d8d1c5]">{description}</p></article>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--public-border)] py-12 sm:py-16 lg:py-20">
        <div className="public-layout-container grid gap-6 lg:grid-cols-2">
          <article className="public-card"><span className="public-icon"><FiUsers aria-hidden="true" /></span><p className="public-eyebrow mt-6">Execution partners</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--public-text)]">Specialists stay responsible for specialist work</h2><p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">Procurement teams, laboratories, packaging providers, warehouses, transporters, freight forwarders, and documentation partners work through role-specific handoffs.</p><Link href="/roles" className="mt-6 inline-flex min-h-11 items-center gap-2 font-bold text-[var(--public-accent)]">Explore roles <FiArrowRight aria-hidden="true" /></Link></article>
          <article className="public-card"><span className="public-icon"><FiCode aria-hidden="true" /></span><p className="public-eyebrow mt-6">Connected systems</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--public-text)]">Bring trade context into existing workflows</h2><p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">Developer APIs and connectors support product data, enquiry capture, calculation, and approved automation paths without separating the action from its business context.</p><Link href="/developer" className="mt-6 inline-flex min-h-11 items-center gap-2 font-bold text-[var(--public-accent)]">Open developer documentation <FiArrowRight aria-hidden="true" /></Link></article>
        </div>
      </section>
    </div>
  );
}
