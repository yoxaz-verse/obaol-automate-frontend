import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import ThemedContentWrapper from "@/components/layout/ThemedContentWrapper";
import { buildMetadata, buildWebPageJsonLd } from "@/utils/seo";
import {
  associateRoleGroups,
  associateRoleSlugs,
  getAssociateRoleBySlug,
  getAssociateRolePath,
} from "@/data/associateRoles";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBriefcase,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiHelpCircle,
  FiShield,
  FiStar,
  FiUsers,
  FiZap,
} from "react-icons/fi";

type Params = { roleSlug: string };

export function generateStaticParams() {
  return associateRoleSlugs.map((roleSlug) => ({ roleSlug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const role = getAssociateRoleBySlug(params.roleSlug);
  if (!role)
    return buildMetadata({
      title: "Associate Business Roles | OBAOL",
      description:
        "Explore the verified business roles that participate in OBAOL commodity workflows.",
      path: "/roles/associate",
    });
  return buildMetadata({
    title: role.seo.title,
    description: role.seo.description,
    keywords: role.seo.keywords,
    path: getAssociateRolePath(role.slug),
    type: "article",
  });
}

type CapabilityTone = "emerald" | "amber" | "purple";

const toneStyles: Record<
  CapabilityTone,
  {
    border: string;
    bgGradient: string;
    badgeBorder: string;
    badgeBg: string;
    badgeText: string;
    iconBg: string;
    iconText: string;
    hoverBorder: string;
    hoverIconBg: string;
    pillBg: string;
    pillText: string;
    label: string;
  }
> = {
  emerald: {
    border: "border-emerald-500/25 dark:border-emerald-500/35",
    bgGradient:
      "from-emerald-500/[0.06] via-emerald-500/[0.01] to-background",
    badgeBorder: "border-emerald-500/30",
    badgeBg: "bg-emerald-500/10",
    badgeText: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-500/15 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    iconText: "text-emerald-500",
    hoverBorder: "hover:border-emerald-500/40",
    hoverIconBg: "group-hover:bg-emerald-500 group-hover:text-white",
    pillBg: "bg-emerald-500/10 border-emerald-500/20",
    pillText: "text-emerald-600 dark:text-emerald-400",
    label: "Live Capability",
  },
  amber: {
    border: "border-amber-500/25 dark:border-amber-500/35",
    bgGradient: "from-amber-500/[0.06] via-amber-500/[0.01] to-background",
    badgeBorder: "border-amber-500/30",
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-500/15 border-amber-500/20 text-amber-600 dark:text-amber-400",
    iconText: "text-amber-500",
    hoverBorder: "hover:border-amber-500/40",
    hoverIconBg: "group-hover:bg-amber-500 group-hover:text-white",
    pillBg: "bg-amber-500/10 border-amber-500/20",
    pillText: "text-amber-600 dark:text-amber-400",
    label: "In Engineering",
  },
  purple: {
    border: "border-purple-500/25 dark:border-purple-500/35",
    bgGradient: "from-purple-500/[0.06] via-purple-500/[0.01] to-background",
    badgeBorder: "border-purple-500/30",
    badgeBg: "bg-purple-500/10",
    badgeText: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-500/15 border-purple-500/20 text-purple-600 dark:text-purple-400",
    iconText: "text-purple-500",
    hoverBorder: "hover:border-purple-500/40",
    hoverIconBg: "group-hover:bg-purple-500 group-hover:text-white",
    pillBg: "bg-purple-500/10 border-purple-500/20",
    pillText: "text-purple-600 dark:text-purple-400",
    label: "Co-Development",
  },
};

const CapabilityFeatureGrid = ({
  items,
  tone = "emerald",
}: {
  items: string[];
  tone?: CapabilityTone;
}) => {
  const style = toneStyles[tone];
  return (
    <div className="grid gap-3.5 sm:grid-cols-1">
      {items.map((item) => (
        <div
          key={item}
          className={`group relative flex items-start gap-4 rounded-2xl border border-default-200/70 bg-background/80 p-4 shadow-2xs backdrop-blur-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-background hover:shadow-md ${style.hoverBorder}`}
        >
          <div
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${style.iconBg} ${style.hoverIconBg}`}
          >
            <FiCheck className="h-4 w-4 stroke-[3]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-6 text-foreground/85 md:text-base">
              {item}
            </p>
          </div>
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${style.pillBg} ${style.pillText}`}
          >
            {style.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function AssociateRoleDetailPage({
  params,
}: {
  params: Params;
}) {
  const role = getAssociateRoleBySlug(params.roleSlug);
  if (!role) notFound();

  const group = associateRoleGroups.find((item) => item.key === role.group);
  const relatedRoles = role.relatedRoles
    .map(getAssociateRoleBySlug)
    .filter(Boolean);
  const registrationHref = `/auth/register?intent=${role.registrationIntent}&prefill=${encodeURIComponent(role.displayName)}`;

  const webPageJsonLd = buildWebPageJsonLd({
    title: role.seo.title,
    description: role.seo.description,
    path: getAssociateRolePath(role.slug),
  });
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: role.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Roles", item: "https://obaol.com/roles" },
      { "@type": "ListItem", position: 2, name: "Associates", item: "https://obaol.com/roles/associate" },
      {
        "@type": "ListItem",
        position: 3,
        name: role.displayName,
        item: `https://obaol.com${getAssociateRolePath(role.slug)}`,
      },
    ],
  };

  return (
    <section className="min-h-screen overflow-hidden bg-background text-foreground selection:bg-orange-500/30">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Header />
      <ThemedContentWrapper>
        <main>
          {/* Hero Section */}
          <section className="public-hero relative overflow-hidden">
            <div className="absolute left-1/2 top-0 h-96 w-full max-w-4xl -translate-x-1/2 rounded-full bg-orange-500/5 blur-[120px] public-decoration" />
            <div className="container mx-auto max-w-6xl px-4 public-layout-container relative z-10">
              <Link
                href="/roles/associate"
                className="public-back-link group"
              >
                <FiArrowLeft className="transition-transform group-hover:-translate-x-1" />
                Back to Associate roles
              </Link>
              <div className="public-hero-content max-w-4xl space-y-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-orange-500/25 bg-orange-500/10 px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                    {group?.label}
                  </span>
                  {role.participationModes.map((mode) => (
                    <span
                      key={mode}
                      className="rounded-full border border-default-200/80 bg-content1/80 px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-foreground/60"
                    >
                      {mode === "SERVICE" ? "Trade services" : mode}
                    </span>
                  ))}
                </div>

                <h1 className="public-hero-title">
                  {role.displayName}{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600 italic">
                    on OBAOL
                  </span>
                </h1>

                <p className="public-hero-description max-w-3xl">
                  {role.longDescription}
                </p>

                <div className="relative overflow-hidden rounded-2xl border border-default-200/80 border-l-4 border-l-orange-500 bg-content1/50 p-5 backdrop-blur-xs max-w-3xl shadow-2xs">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                    <FiStar className="h-3.5 w-3.5" /> Best suited to
                  </div>
                  <p className="mt-2 font-semibold leading-7 text-foreground/85">
                    {role.bestFor}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href={registrationHref}
                    className="public-button public-button--primary group shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                  >
                    {role.ctaLabel}{" "}
                    <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                  </Link>
                  <a
                    href="#qualification"
                    className="public-button public-button--secondary"
                  >
                    Check eligibility
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Capabilities & Features Section */}
          <section
            aria-labelledby="capability-status-heading"
            className="public-standard-section border-y border-default-200/60 bg-content1/30 py-16"
          >
            <div className="container mx-auto max-w-6xl px-4 public-layout-container">
              <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-[0.2em] text-orange-500">
                    <FiZap className="h-3.5 w-3.5" /> Clear capability status
                  </span>
                  <h2
                    id="capability-status-heading"
                    className="mt-3 text-3xl font-black tracking-tight md:text-5xl"
                  >
                    Features for {role.displayName}
                  </h2>
                </div>
                <p className="text-sm font-medium text-foreground/60 max-w-md">
                  Transparent breakdown of live capabilities, active engineering roadmap goals, and co-development opportunities.
                </p>
              </div>

              <div
                className="space-y-6"
                data-testid="associate-capability-sections"
              >
                {/* Available now */}
                <article className="public-surface-card relative overflow-hidden rounded-[2rem] border border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.05] via-emerald-500/[0.01] to-background p-7 md:p-9 shadow-sm transition-all hover:shadow-md">
                  <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
                          <FiCheckCircle className="h-6 w-6" />
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          Available now
                        </span>
                      </div>
                      <h3 className="text-2xl font-black tracking-tight text-foreground">
                        Working OBAOL capabilities
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-foreground/65">
                        Features registered companies can use today in their live workspace.
                      </p>
                      <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <span>{role.availableNow.length} Active {role.availableNow.length === 1 ? 'Feature' : 'Features'}</span>
                      </div>
                    </div>
                    <CapabilityFeatureGrid
                      items={role.availableNow}
                      tone="emerald"
                    />
                  </div>
                </article>

                {/* Coming next */}
                <article className="public-surface-card relative overflow-hidden rounded-[2rem] border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.05] via-amber-500/[0.01] to-background p-7 md:p-9 shadow-sm transition-all hover:shadow-md">
                  <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-2xs">
                          <FiClock className="h-6 w-6" />
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          Coming next
                        </span>
                      </div>
                      <h3 className="text-2xl font-black tracking-tight text-foreground">
                        Planned improvements
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-foreground/65">
                        Planned or partial capabilities—not live-feature promises.
                      </p>
                      <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                        <span>{role.comingNext.length} Roadmap {role.comingNext.length === 1 ? 'Item' : 'Items'}</span>
                      </div>
                    </div>
                    {role.comingNext.length > 0 ? (
                      <CapabilityFeatureGrid
                        items={role.comingNext}
                        tone="amber"
                      />
                    ) : (
                      <div className="rounded-2xl border border-dashed border-default-200/80 bg-background/50 p-6 text-center">
                        <p className="text-sm font-medium text-foreground/65">
                          No role-specific roadmap item is being announced at this time.
                        </p>
                      </div>
                    )}
                  </div>
                </article>

                {/* Collaborate with OBAOL */}
                <article className="public-surface-card relative overflow-hidden rounded-[2rem] border border-purple-500/25 bg-gradient-to-br from-purple-500/[0.05] via-purple-500/[0.01] to-background p-7 md:p-9 shadow-sm transition-all hover:shadow-md">
                  <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20 shadow-2xs">
                          <FiZap className="h-6 w-6" />
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                          Collaborate with OBAOL
                        </span>
                      </div>
                      <h3 className="text-2xl font-black tracking-tight text-foreground">
                        Build the next workflow together
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-foreground/65">
                        Partnerships begin with capability review and discussion.
                      </p>
                      <div className="mt-6">
                        <Link
                          href={registrationHref}
                          className="public-button public-button--primary group inline-flex items-center gap-2 shadow-md shadow-orange-500/20"
                        >
                          Register and discuss collaboration{" "}
                          <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                    <CapabilityFeatureGrid
                      items={role.collaborationOpportunities}
                      tone="purple"
                    />
                  </div>
                </article>
              </div>
            </div>
          </section>

          {/* Qualification Section */}
          <section
            id="qualification"
            aria-labelledby="qualification-heading"
            className="public-standard-section scroll-mt-24 py-16"
          >
            <div className="container mx-auto grid max-w-6xl gap-8 px-4 public-layout-container lg:grid-cols-[0.85fr_1.15fr]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                  Qualification
                </span>
                <h2
                  id="qualification-heading"
                  className="mt-3 text-3xl font-black tracking-tight md:text-5xl"
                >
                  Is this your business?
                </h2>
                <p className="mt-4 text-base leading-7 text-foreground/65">
                  This role fits when the registered company—not only the person applying—meets these conditions.
                </p>
              </div>
              <div className="public-surface-card rounded-[2rem] border border-default-200/70 bg-background p-6 md:p-8 shadow-sm">
                <div className="grid gap-3.5">
                  {role.eligibility.map((item) => (
                    <div
                      key={item}
                      className="group flex items-start gap-3.5 rounded-xl border border-default-200/60 bg-content1/30 p-4 transition-all hover:bg-content1/60 hover:border-orange-500/30"
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                        <FiCheck className="h-4 w-4 stroke-[3]" />
                      </div>
                      <span className="text-sm font-semibold leading-6 text-foreground/80">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Registration choices */}
          <section
            aria-labelledby="business-account-heading"
            className="public-standard-section border-y border-default-200/60 bg-content1/30 py-16"
          >
            <div className="container mx-auto max-w-6xl px-4 public-layout-container">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="group rounded-[2rem] border border-orange-500/30 bg-background p-8 shadow-sm transition-all hover:shadow-md hover:border-orange-500/50">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <FiBriefcase className="text-2xl" />
                  </div>
                  <h2
                    id="business-account-heading"
                    className="text-2xl font-black"
                  >
                    Register as an Associate
                  </h2>
                  <p className="mt-4 leading-7 text-foreground/65">
                    Choose this route when you are authorized to register the company and can provide its legal and operating details.
                  </p>
                  <Link
                    href={registrationHref}
                    className="public-button public-button--primary mt-6 group/btn inline-flex items-center gap-2 shadow-md shadow-orange-500/20"
                  >
                    Register as an Associate{" "}
                    <FiArrowRight className="transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </div>
                <div className="group rounded-[2rem] border border-default-200/70 bg-background p-8 shadow-sm transition-all hover:shadow-md hover:border-default-300">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground/5 text-foreground/60 group-hover:bg-foreground group-hover:text-background transition-colors">
                    <FiUsers className="text-2xl" />
                  </div>
                  <h2 className="text-2xl font-black">Joining as an individual?</h2>
                  <p className="mt-4 leading-7 text-foreground/65">
                    Individuals who build relationships and coordinate trade execution should review the Operator role instead.
                  </p>
                  <Link
                    href="/roles/operator"
                    className="mt-6 inline-flex items-center gap-2 font-bold text-orange-500 hover:text-orange-600 transition-colors group/link"
                  >
                    Explore Operator{" "}
                    <FiArrowRight className="transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section
            aria-labelledby="faq-heading"
            className="public-standard-section py-16"
          >
            <div className="container mx-auto max-w-6xl px-4 public-layout-container">
              <div className="mb-10 flex items-center gap-4">
                <div className="rounded-xl bg-orange-500/10 p-3 text-orange-500">
                  <FiHelpCircle className="h-6 w-6" />
                </div>
                <h2 id="faq-heading" className="text-3xl font-black">
                  Frequently asked questions
                </h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {role.faqs.map((faq) => (
                  <article
                    key={faq.question}
                    className="public-surface-card rounded-3xl border border-default-200/70 bg-content1/30 p-7 shadow-2xs transition-all hover:border-orange-500/30 hover:shadow-sm"
                  >
                    <h3 className="text-xl font-bold leading-7 text-foreground">
                      {faq.question}
                    </h3>
                    <p className="mt-3 leading-7 text-foreground/65">
                      {faq.answer}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Related roles */}
          {relatedRoles.length > 0 && (
            <section
              aria-labelledby="related-heading"
              className="public-standard-section border-t border-default-200/60 bg-foreground/[0.025] py-16"
            >
              <div className="container mx-auto max-w-6xl px-4 public-layout-container">
                <h2 id="related-heading" className="text-3xl font-black">
                  Companies you may work alongside
                </h2>
                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedRoles.map(
                    (relatedRole) =>
                      relatedRole && (
                        <Link
                          key={relatedRole.slug}
                          href={getAssociateRolePath(relatedRole.slug)}
                          className="public-surface-card group rounded-3xl border border-default-200/70 bg-background p-6 transition-all hover:-translate-y-1 hover:border-orange-500/40 hover:shadow-md"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-foreground">
                              {relatedRole.displayName}
                            </span>
                            <FiArrowRight className="text-orange-500 transition-transform group-hover:translate-x-1" />
                          </div>
                          <p className="mt-3 text-sm leading-6 text-foreground/65">
                            {relatedRole.shortDescription}
                          </p>
                        </Link>
                      )
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Final CTA */}
          <section className="public-standard-section text-center py-20">
            <div className="container mx-auto max-w-3xl px-4 public-layout-container">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-2xl text-orange-500 border border-orange-500/20 shadow-2xs">
                <FiShield />
              </div>
              <h2 className="text-3xl font-black md:text-5xl">
                Ready to register the company?
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-foreground/65">
                Complete the business profile, select the right participation mode, and provide the capabilities that should shape the company&apos;s workspace.
              </p>
              <Link
                href={registrationHref}
                className="public-button public-button--primary group mt-8 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all"
              >
                {role.ctaLabel}{" "}
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </section>
        </main>
      </ThemedContentWrapper>
      <Footer />
    </section>
  );
}

