import { FiArrowRight, FiCompass, FiShield, FiUsers } from "react-icons/fi";
import Link from "next/link";

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

export default function PerspectiveGateway() {
  return (
    <section aria-labelledby="obaol-perspective-heading" className="relative overflow-hidden border-t border-default-200/60 bg-background py-16 md:py-24">
      <div className="public-layout-container relative z-10 container mx-auto px-6 sm:px-12">
        <div className="max-w-3xl space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-obaol-500/20 bg-obaol-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-obaol-700 dark:text-obaol-300">
            The OBAOL Perspective
          </div>
          <h2 id="obaol-perspective-heading" className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Trade is more than buying and selling.
          </h2>
          <p className="text-base sm:text-lg text-foreground/75 font-medium leading-relaxed">
            OBAOL helps participants understand the market, act with verified confidence, and execute through trust—not merely complete transactions.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {perspectives.map((perspective) => {
            const Icon = perspective.icon;
            return (
              <article
                key={perspective.href}
                data-perspective-card="true"
                className="group relative flex flex-col justify-between rounded-3xl border border-default-200/80 bg-content1/80 p-8 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-obaol-500/50 hover:shadow-xl hover:shadow-obaol-500/10"
              >
                {/* Gold Top Highlight Accent Line */}
                <div className="absolute inset-x-8 top-0 h-0.5 bg-gradient-to-r from-transparent via-obaol-500/0 to-transparent transition-all duration-500 group-hover:via-obaol-500/80" />

                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-obaol-500/10 text-obaol-600 dark:text-obaol-300 transition-transform duration-300 group-hover:scale-110">
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <span className="font-mono text-xs font-bold text-foreground/40">{perspective.number}</span>
                  </div>

                  <span className="text-[11px] font-bold uppercase tracking-widest text-obaol-700 dark:text-obaol-300">
                    {perspective.signal}
                  </span>
                  <h3 className="mt-2 text-xl font-bold tracking-tight text-foreground">{perspective.title}</h3>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-foreground/70">{perspective.description}</p>
                </div>

                <Link
                  href={perspective.href}
                  className="group/btn mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-obaol-700 dark:text-obaol-300 hover:text-obaol-500 transition-colors"
                >
                  <span>{perspective.cta}</span>
                  <FiArrowRight size={16} className="transition-transform duration-200 group-hover/btn:translate-x-1" />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

