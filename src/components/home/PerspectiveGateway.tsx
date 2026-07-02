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
      className="border-y border-default-200/60 bg-content1/30 py-14 md:py-20"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-12">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-warning-600">
          The OBAOL perspective
        </p>
        <h2
          id="obaol-perspective-heading"
          className="mt-3 text-3xl font-bold tracking-tight md:text-5xl"
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
              className="flex h-full flex-col rounded-3xl border border-default-200 bg-background p-6 md:p-7"
            >
              <h3 className="text-xl font-bold">{perspective.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-foreground/60">
                {perspective.description}
              </p>
              <Link
                href={perspective.href}
                className="mt-5 inline-flex min-h-11 w-fit items-center rounded-xl bg-warning-500 px-4 py-2 text-sm font-bold text-slate-950 transition-colors hover:bg-warning-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
