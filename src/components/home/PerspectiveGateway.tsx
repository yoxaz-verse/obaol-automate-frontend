import Link from "next/link";

const perspectives = [
  {
    title: "Understand the market",
    description:
      "Learn how OBAOL sees the gaps in commodity trade—and why trust, context, and disciplined execution matter.",
    href: "/why-obaol",
    cta: "Read our perspective",
  },
  {
    title: "Work with confidence",
    description:
      "See how verification, market protection, and structured coordination create a more credible trade environment.",
    href: "/trust",
    cta: "Explore our standards",
  },
  {
    title: "Find your place",
    description:
      "Buyers, suppliers, exporters, service partners, and operators can contribute through roles that go beyond a single transaction.",
    href: "/roles",
    cta: "Explore the ecosystem",
  },
] as const;

export default function PerspectiveGateway() {
  return (
    <section
      aria-labelledby="obaol-perspective-heading"
      className="relative border-y border-obaol-500/15 bg-gradient-to-b from-obaol-50/50 via-content1/30 to-background py-14 dark:from-obaol-950/30 dark:via-content1/20 md:py-20"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-12">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-obaol-700 dark:text-obaol-300">
          The OBAOL perspective
        </p>
        <h2
          id="obaol-perspective-heading"
          className="mt-3 text-3xl font-bold tracking-[-0.025em] md:text-5xl"
        >
          Trade is more than buying and selling.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-foreground/65">
          OBAOL helps people understand the market, participate responsibly, and execute through trust—not merely complete transactions.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {perspectives.map((perspective) => (
            <article
              key={perspective.href}
              className="flex h-full flex-col rounded-3xl border border-default-200 bg-background p-6 transition-all duration-300 hover:-translate-y-1 hover:border-obaol-500/35 hover:shadow-[0_18px_45px_-30px_rgba(207,152,60,0.65)] md:p-7"
            >
              <h3 className="text-xl font-bold">{perspective.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-foreground/60">
                {perspective.description}
              </p>
              <Link
                href={perspective.href}
                className="mt-5 inline-flex min-h-11 w-fit items-center rounded-xl border border-obaol-300/40 bg-obaol-500 px-4 py-2 text-sm font-bold text-obaol-950 transition-all hover:-translate-y-0.5 hover:bg-obaol-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obaol-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {perspective.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
