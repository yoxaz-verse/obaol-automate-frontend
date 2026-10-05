import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import ThemedContentWrapper from "@/components/layout/ThemedContentWrapper";
import { buildMetadata, buildWebPageJsonLd } from "@/utils/seo";
import { associateRoleGroups, associateRoleSlugs, getAssociateRoleBySlug, getAssociateRolePath } from "@/data/associateRoles";
import { FiArrowLeft, FiArrowRight, FiBriefcase, FiCheckCircle, FiClipboard, FiHelpCircle, FiLayers, FiShield, FiTarget, FiUsers } from "react-icons/fi";

type Params = { roleSlug: string };

export function generateStaticParams() {
  return associateRoleSlugs.map((roleSlug) => ({ roleSlug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const role = getAssociateRoleBySlug(params.roleSlug);
  if (!role) return buildMetadata({ title: "Associate Business Roles | OBAOL", description: "Explore the verified business roles that participate in OBAOL commodity workflows.", path: "/roles/associate" });
  return buildMetadata({ title: role.seo.title, description: role.seo.description, keywords: role.seo.keywords, path: getAssociateRolePath(role.slug), type: "article" });
}

const StepList = ({ items, tone = "orange" }: { items: string[]; tone?: "orange" | "green" }) => (
  <ul className="space-y-4">
    {items.map((item) => (
      <li key={item} className="flex items-start gap-3 leading-7 text-foreground/75">
        <FiCheckCircle className={`mt-1 shrink-0 ${tone === "green" ? "text-success" : "text-orange-500"}`} />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

export default function AssociateRoleDetailPage({ params }: { params: Params }) {
  const role = getAssociateRoleBySlug(params.roleSlug);
  if (!role) notFound();
  const group = associateRoleGroups.find((item) => item.key === role.group);
  const relatedRoles = role.relatedRoles.map(getAssociateRoleBySlug).filter(Boolean);
  const registrationHref = `/auth/register?intent=${role.registrationIntent}&prefill=${encodeURIComponent(role.displayName)}`;
  const webPageJsonLd = buildWebPageJsonLd({ title: role.seo.title, description: role.seo.description, path: getAssociateRolePath(role.slug) });
  const faqJsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: role.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) };
  const breadcrumbJsonLd = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Roles", item: "https://obaol.com/roles" },
    { "@type": "ListItem", position: 2, name: "Associates", item: "https://obaol.com/roles/associate" },
    { "@type": "ListItem", position: 3, name: role.displayName, item: `https://obaol.com${getAssociateRolePath(role.slug)}` },
  ] };

  return (
    <section className="min-h-screen overflow-hidden bg-background text-foreground selection:bg-orange-500/30">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Header />
      <ThemedContentWrapper>
        <main>
          <section className="public-hero relative overflow-hidden">
            <div className="absolute left-1/2 top-0 h-96 w-full max-w-4xl -translate-x-1/2 rounded-full bg-orange-500/5 blur-[120px] public-decoration" />
            <div className="container mx-auto max-w-6xl px-4 public-layout-container relative z-10">
              <Link href="/roles/associate" className="public-back-link group"><FiArrowLeft className="transition-transform group-hover:-translate-x-1" /> Back to Associate roles</Link>
              <div className="public-hero-content max-w-4xl space-y-6">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-orange-500/20 bg-orange-500/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{group?.label}</span>
                  {role.participationModes.map((mode) => <span key={mode} className="rounded-full border border-default-200 bg-content1 px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-foreground/55">{mode === "SERVICE" ? "Trade services" : mode}</span>)}
                </div>
                <h1 className="public-hero-title">{role.displayName} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 italic">on OBAOL</span></h1>
                <p className="public-hero-description max-w-3xl">{role.longDescription}</p>
                <div className="rounded-2xl border border-default-200/70 bg-content1/60 p-5 max-w-3xl">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Best suited to</p>
                  <p className="mt-2 font-semibold leading-7 text-foreground/80">{role.bestFor}</p>
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link href={registrationHref} className="public-button public-button--primary group">{role.ctaLabel} <FiArrowRight className="transition-transform group-hover:translate-x-1" /></Link>
                  <a href="#qualification" className="public-button public-button--secondary">Check eligibility</a>
                </div>
              </div>
            </div>
          </section>

          <section id="qualification" aria-labelledby="qualification-heading" className="public-standard-section border-y border-default-200/60 bg-content1/30 scroll-mt-24">
            <div className="container mx-auto grid max-w-6xl gap-8 px-4 public-layout-container lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">Qualification</span>
                <h2 id="qualification-heading" className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Is this your business?</h2>
                <p className="mt-5 text-lg leading-8 text-foreground/65">Associate accounts represent verified businesses. This role fits when the company—not only the person registering—meets these conditions.</p>
              </div>
              <div className="public-surface-card rounded-[2rem] border border-default-200/70 bg-background p-7 md:p-9"><StepList items={role.eligibility} /></div>
            </div>
          </section>

          <section aria-labelledby="responsibilities-heading" className="public-standard-section">
            <div className="container mx-auto max-w-6xl px-4 public-layout-container">
              <div className="mb-10 max-w-3xl">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">Role in execution</span>
                <h2 id="responsibilities-heading" className="mt-3 text-3xl font-black tracking-tight md:text-5xl">What your company is responsible for</h2>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                {role.responsibilities.map((item, index) => (
                  <div key={item} className="public-surface-card flex gap-5 rounded-3xl border border-default-200/70 bg-content1/35 p-6">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-xs font-black text-orange-500">0{index + 1}</span>
                    <p className="pt-1 font-semibold leading-7 text-foreground/75">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section aria-labelledby="workflow-heading" className="public-standard-section border-y border-default-200/60 bg-background">
            <div className="container mx-auto max-w-6xl px-4 public-layout-container">
              <div className="mb-10 max-w-3xl">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">Company journey</span>
                <h2 id="workflow-heading" className="mt-3 text-3xl font-black tracking-tight md:text-5xl">How the workflow starts on OBAOL</h2>
              </div>
              <ol className="m-0 grid list-none gap-5 p-0 md:grid-cols-2 lg:grid-cols-4">
                {role.workflow.map((item, index) => (
                  <li key={item} className="public-surface-card rounded-3xl border border-default-200/70 bg-background p-6">
                    <span className="text-4xl font-black text-orange-500/25">{String(index + 1).padStart(2, "0")}</span>
                    <p className="mt-5 font-semibold leading-7 text-foreground/75">{item}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section aria-labelledby="support-heading" className="public-standard-section">
            <div className="container mx-auto grid max-w-6xl gap-8 px-4 public-layout-container lg:grid-cols-2">
              <div className="public-surface-card rounded-[2rem] border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-background p-8">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500"><FiLayers /></div>
                <h2 id="support-heading" className="text-3xl font-black">What OBAOL supports</h2>
                <div className="mt-7"><StepList items={role.platformBenefits} /></div>
              </div>
              <div className="public-surface-card rounded-[2rem] border border-success/20 bg-gradient-to-br from-success/5 to-background p-8">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success"><FiClipboard /></div>
                <h2 className="text-3xl font-black">What to prepare for registration</h2>
                <div className="mt-7"><StepList items={role.prerequisites} tone="green" /></div>
              </div>
            </div>
          </section>

          <section aria-labelledby="business-account-heading" className="public-standard-section border-y border-default-200/60 bg-content1/30">
            <div className="container mx-auto max-w-6xl px-4 public-layout-container">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-[2rem] border border-orange-500/25 bg-background p-8">
                  <FiBriefcase className="mb-5 text-3xl text-orange-500" />
                  <h2 id="business-account-heading" className="text-2xl font-black">Register as an Associate</h2>
                  <p className="mt-4 leading-7 text-foreground/65">Choose this route when you are authorized to register the company and can provide its legal and operating details.</p>
                </div>
                <div className="rounded-[2rem] border border-default-200/70 bg-background p-8">
                  <FiUsers className="mb-5 text-3xl text-foreground/50" />
                  <h2 className="text-2xl font-black">Joining as an individual?</h2>
                  <p className="mt-4 leading-7 text-foreground/65">Individuals who build relationships and coordinate trade execution should review the Operator role instead.</p>
                  <Link href="/roles/operator" className="mt-5 inline-flex items-center gap-2 font-bold text-orange-500">Explore Operator <FiArrowRight /></Link>
                </div>
              </div>
            </div>
          </section>

          <section aria-labelledby="faq-heading" className="public-standard-section">
            <div className="container mx-auto max-w-6xl px-4 public-layout-container">
              <div className="mb-10 flex items-center gap-4"><div className="rounded-xl bg-foreground/5 p-3 text-foreground/60"><FiHelpCircle /></div><h2 id="faq-heading" className="text-3xl font-black">Frequently asked questions</h2></div>
              <div className="grid gap-6 md:grid-cols-2">
                {role.faqs.map((faq) => <article key={faq.question} className="public-surface-card rounded-3xl border border-default-200/70 bg-content1/30 p-7"><h3 className="text-xl font-bold leading-7">{faq.question}</h3><p className="mt-3 leading-7 text-foreground/65">{faq.answer}</p></article>)}
              </div>
            </div>
          </section>

          {relatedRoles.length > 0 && (
            <section aria-labelledby="related-heading" className="public-standard-section border-t border-default-200/60 bg-foreground/[0.025]">
              <div className="container mx-auto max-w-6xl px-4 public-layout-container">
                <h2 id="related-heading" className="text-3xl font-black">Companies you may work alongside</h2>
                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedRoles.map((relatedRole) => relatedRole && <Link key={relatedRole.slug} href={getAssociateRolePath(relatedRole.slug)} className="public-surface-card group rounded-3xl border border-default-200/70 bg-background p-6 transition-all hover:-translate-y-1 hover:border-orange-500/40"><div className="flex items-center justify-between"><span className="text-lg font-bold">{relatedRole.displayName}</span><FiArrowRight className="text-orange-500 transition-transform group-hover:translate-x-1" /></div><p className="mt-3 text-sm leading-6 text-foreground/60">{relatedRole.shortDescription}</p></Link>)}
                </div>
              </div>
            </section>
          )}

          <section className="public-standard-section text-center">
            <div className="container mx-auto max-w-3xl px-4 public-layout-container">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-2xl text-orange-500"><FiShield /></div>
              <h2 className="text-3xl font-black md:text-5xl">Ready to register the company?</h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-foreground/65">Complete the business profile, select the right participation mode, and provide the capabilities that should shape the company&apos;s workspace.</p>
              <Link href={registrationHref} className="public-button public-button--primary mt-8">{role.ctaLabel} <FiArrowRight /></Link>
            </div>
          </section>
        </main>
      </ThemedContentWrapper>
      <Footer />
    </section>
  );
}
