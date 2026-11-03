import Link from "next/link";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import ThemedContentWrapper from "@/components/layout/ThemedContentWrapper";
import ScenarioBody from "@/components/public/ScenarioBody";
import { getScenarioRole, getScenarioRolePath, getScenarioStoryPath, isOperatorScenarioRole } from "@/data/scenarioRoles";
import type { RealLifeScenario } from "@/types/realLifeScenario";
import { FiArrowLeft, FiArrowRight, FiUsers } from "react-icons/fi";

export default function ScenarioPageView({ scenario, related = [], preview = false }: { scenario: RealLifeScenario; related?: RealLifeScenario[]; preview?: boolean }) {
  const role = getScenarioRole(scenario.roleSlug);
  if (!role) return null;
  const rolePath = getScenarioRolePath(role.slug);
  const operator = isOperatorScenarioRole(role.slug);
  return <section className="min-h-screen bg-background text-foreground">
    <Header />
    <ThemedContentWrapper>
      <main>
        {preview && <div className="border-y border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center text-sm font-bold text-amber-700 dark:text-amber-300">Private draft preview · This page is not indexed.</div>}
        <article>
          <header className="public-hero border-b border-default-200/60">
            <div className="container mx-auto max-w-5xl px-4 public-layout-container">
              <Link href={rolePath} className="public-back-link"><FiArrowLeft /> Back to {role.displayName}</Link>
              <nav aria-label="Breadcrumb" className="mt-8 text-sm text-foreground/55">
                <Link href={operator ? "/roles/operator" : "/roles/associate"} className="hover:text-orange-500">{operator ? "Operator role" : "Associate roles"}</Link> <span aria-hidden> / </span>
                <Link href={rolePath} className="hover:text-orange-500">{role.displayName}</Link> <span aria-hidden> / </span>
                <span>Real-life scenario</span>
              </nav>
              <div className="mt-6 max-w-4xl">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-orange-500">Industry scenario</span>
                  <span className="rounded-full border border-default-200 px-3 py-1 text-xs font-bold text-foreground/60">{role.displayName}</span>
                </div>
                <h1 className="public-hero-title mt-5">{scenario.h1}</h1>
                <p className="public-hero-description mt-6 max-w-3xl">{scenario.excerpt}</p>
                {scenario.audienceIntent && <p className="mt-5 flex items-start gap-2 text-sm text-foreground/60"><FiUsers className="mt-1 shrink-0" /> <span><strong className="text-foreground/80">For:</strong> {scenario.audienceIntent}</span></p>}
              </div>
            </div>
          </header>

          <div className="container mx-auto grid max-w-5xl gap-10 px-4 py-14 public-layout-container lg:grid-cols-[minmax(0,1fr)_240px]">
            <div>
              {scenario.heroImageUrl && scenario.heroImageAlt && <>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={scenario.heroImageUrl} alt={scenario.heroImageAlt} className="mb-10 aspect-[16/9] w-full rounded-3xl border border-default-200 object-cover" /></>}
              <ScenarioBody blocks={scenario.blocks || []} />

              {scenario.faqs?.length > 0 && <section aria-labelledby="scenario-faq-heading" className="mt-16 border-t border-default-200 pt-12">
                <h2 id="scenario-faq-heading" className="text-3xl font-black">Frequently asked questions</h2>
                <div className="mt-6 space-y-4">{scenario.faqs.map((faq) => <article key={faq.question} className="rounded-3xl border border-default-200 bg-content1/40 p-6"><h3 className="text-lg font-bold">{faq.question}</h3><p className="mt-3 leading-7 text-foreground/65">{faq.answer}</p></article>)}</div>
              </section>}

              <section className="mt-14 rounded-[2rem] border border-orange-500/25 bg-orange-500/[0.06] p-7 md:p-9">
                <h2 className="text-2xl font-black">Explore the {operator ? "Operator" : role.displayName} role on OBAOL</h2>
                <p className="mt-3 leading-7 text-foreground/65">Review eligibility, responsibilities, available capabilities, and registration steps for this business role.</p>
                <Link href={scenario.cta?.href || rolePath} className="public-button public-button--primary mt-6 inline-flex items-center gap-2">{scenario.cta?.label || `Explore ${role.displayName}`} <FiArrowRight /></Link>
              </section>
            </div>
            <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-3xl border border-default-200 bg-content1/40 p-5"><p className="text-xs font-black uppercase tracking-wider text-orange-500">Primary topic</p><p className="mt-2 font-bold">{scenario.primaryKeyword}</p></div>
              {related.length > 0 && <div><h2 className="text-lg font-black">More {role.displayName} scenarios</h2><div className="mt-3 space-y-3">{related.filter((item) => item._id !== scenario._id).map((item) => <Link key={item._id} href={getScenarioStoryPath(role.slug, item.slug)} className="block rounded-2xl border border-default-200 p-4 text-sm font-bold hover:border-orange-500/40 hover:text-orange-500">{item.h1}</Link>)}</div></div>}
            </aside>
          </div>
        </article>
      </main>
    </ThemedContentWrapper>
    <Footer />
  </section>;
}
