import Link from "next/link";
import { FiArrowRight, FiCompass, FiLayers, FiShield, FiUsers } from "react-icons/fi";

const perspectives = [
  {
    number: "01 / 03",
    title: "Understand the market",
    description:
      "Learn how OBAOL sees the gaps in commodity trade—and why trust, context, and disciplined execution matter.",
    href: "/why-obaol",
    cta: "Read our perspective",
    icon: FiCompass,
    signal: "Market context",
  },
  {
    number: "02 / 03",
    title: "Work with confidence",
    description:
      "See how verification, market protection, and structured coordination create a more credible trade environment.",
    href: "/trust",
    cta: "Explore our standards",
    icon: FiShield,
    signal: "Verified execution",
  },
  {
    number: "03 / 03",
    title: "Find your place",
    description:
      "Buyers, suppliers, exporters, service partners, and operators can contribute through roles that go beyond a single transaction.",
    href: "/roles",
    cta: "Explore the ecosystem",
    icon: FiUsers,
    signal: "Role-based participation",
  },
] as const;

const proofPoints = ["Market context", "Verified execution", "Role-based participation"] as const;

export default function PerspectiveGateway() {
  return (
    <section
      aria-labelledby="obaol-perspective-heading"
      className="relative overflow-hidden border-y border-obaol-500/15 bg-gradient-to-b from-background via-obaol-50/45 to-background py-16 dark:from-background dark:via-obaol-950/20 md:py-24"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.045] dark:opacity-[0.08] bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-[size:56px_56px]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[48rem] -translate-x-1/2 rounded-full bg-obaol-500/12 blur-[120px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.55fr)] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-obaol-400/25 bg-obaol-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-obaol-700 shadow-[0_18px_50px_-34px_rgba(207,152,60,0.8)] dark:text-obaol-300">
              <span className="h-1.5 w-1.5 rounded-full bg-obaol-400 shadow-[0_0_12px_rgba(207,152,60,0.85)]" aria-hidden="true" />
              The OBAOL perspective
            </div>
            <h2
              id="obaol-perspective-heading"
              className="mt-5 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-foreground md:text-6xl md:leading-[0.98]"
            >
              Trade is more than buying and selling.
            </h2>
            <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-foreground/68 md:text-lg md:leading-8">
              OBAOL helps participants understand the market, act with verified confidence, and execute through trust—not merely complete transactions.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-obaol-400/20 bg-background/70 p-4 shadow-[0_28px_80px_-54px_rgba(207,152,60,0.65)] backdrop-blur-xl dark:bg-black/25">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-foreground/45">
              <FiLayers aria-hidden="true" className="text-obaol-500" />
              What changes
            </div>
            <div className="grid gap-2">
              {proofPoints.map((point) => (
                <div key={point} className="flex items-center gap-3 rounded-2xl border border-default-200/70 bg-content1/70 px-3.5 py-3">
                  <span className="h-2 w-2 rounded-full bg-obaol-400 shadow-[0_0_14px_rgba(207,152,60,0.8)]" aria-hidden="true" />
                  <span className="text-sm font-bold text-foreground/78">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3 md:gap-5">
          {perspectives.map((perspective) => (
            <article
              key={perspective.href}
              data-perspective-card="true"
              className="group relative flex h-full overflow-hidden rounded-[1.75rem] border border-default-200/80 bg-background/82 p-[1px] shadow-[0_24px_80px_-58px_rgba(0,0,0,0.65)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-obaol-400/45 hover:shadow-[0_28px_90px_-52px_rgba(207,152,60,0.68)]"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-obaol-300/80 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative flex h-full w-full flex-col rounded-[calc(1.75rem-1px)] bg-gradient-to-b from-content1/95 to-background/92 p-6 md:p-7">
                <div className="mb-8 flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-obaol-400/20 bg-obaol-500/10 text-obaol-700 transition-transform duration-500 group-hover:scale-110 dark:text-obaol-300">
                    <perspective.icon size={22} aria-hidden="true" />
                  </div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/35">{perspective.number}</span>
                </div>
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-obaol-700/80 dark:text-obaol-300/80">
                  {perspective.signal}
                </p>
                <h3 className="text-2xl font-bold tracking-[-0.025em] text-foreground">{perspective.title}</h3>
                <p className="mt-3 flex-1 text-sm font-medium leading-6 text-foreground/60">
                  {perspective.description}
                </p>
                <Link
                  href={perspective.href}
                  className="group/link mt-7 inline-flex min-h-11 w-fit items-center gap-2 rounded-2xl border border-obaol-300/40 bg-obaol-500 px-4 py-2 text-sm font-bold text-obaol-950 transition-all hover:-translate-y-0.5 hover:bg-obaol-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obaol-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {perspective.cta}
                  <FiArrowRight aria-hidden="true" className="transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
