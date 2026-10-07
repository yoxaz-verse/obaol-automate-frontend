"use client";

import Link from "next/link";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import ThemedContentWrapper from "@/components/layout/ThemedContentWrapper";
import {
  associateRoleGroups,
  getAssociateRolePath,
  getAssociateRolesByGroup,
  type AssociateRoleIconKey,
} from "@/data/associateRoles";
import { buildWebPageJsonLd } from "@/utils/seo";
import {
  FiArchive, FiArrowLeft, FiArrowRight, FiBriefcase, FiCheckCircle, FiCpu,
  FiDollarSign, FiGlobe, FiGrid, FiHome, FiLayers, FiPackage, FiSearch,
  FiShield, FiShoppingBag, FiTarget, FiTruck, FiUsers,
} from "react-icons/fi";

const webPageJsonLd = buildWebPageJsonLd({
  title: "Associate Businesses on OBAOL | Who Can Join",
  description: "See how verified companies join OBAOL to buy, sell, or provide the services that move commodity trades from enquiry to completion.",
  path: "/roles/associate",
});

const iconByRoleKey: Record<AssociateRoleIconKey, JSX.Element> = {
  trader: <FiBriefcase />, importer: <FiShoppingBag />, exporter: <FiGlobe />,
  warehouse: <FiHome />, inlandTransport: <FiTruck />, freightForwarder: <FiTarget />,
  logistics: <FiLayers />, supplier: <FiArchive />, packaging: <FiPackage />,
  qualityLab: <FiSearch />, agritech: <FiCpu />, customs: <FiShield />,
  finance: <FiDollarSign />, procurement: <FiGrid />,
};

const participationPaths = [
  { key: "BUY", title: "Buy commodities", text: "Create requirements, evaluate supply, and follow buyer-side execution.", icon: <FiShoppingBag /> },
  { key: "SELL", title: "Sell commodities", text: "Present credible supply, respond to demand, and coordinate fulfilment.", icon: <FiArchive /> },
  { key: "BOTH", title: "Buy & sell", text: "Operate on both sides through one verified company profile.", icon: <FiBriefcase /> },
  { key: "SERVICE", title: "Provide trade services", text: "Support storage, movement, quality, compliance, finance, or technology needs.", icon: <FiLayers /> },
];

export default function AssociateRolePage() {
  return (
    <section className="min-h-screen bg-background text-foreground selection:bg-orange-500/30">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      <Header />
      <ThemedContentWrapper>
        <main>
          <section className="public-hero relative overflow-hidden">
            <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-orange-500/10 blur-[110px] public-decoration" />
            <div className="container mx-auto max-w-7xl px-4 public-layout-container relative z-10">
              <Link href="/roles" className="public-back-link group">
                <FiArrowLeft className="transition-transform group-hover:-translate-x-1" /> Back to Roles
              </Link>
              <div className="public-hero-content max-w-4xl space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/5 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-orange-500">
                  <FiShield /> Verified business accounts
                </div>
                <h1 className="public-hero-title">Your company&apos;s role in <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 italic">commodity execution.</span></h1>
                <p className="public-hero-description max-w-3xl">
                  Associates are registered businesses that use OBAOL to buy commodities, sell commodities, do both, or deliver the specialist services a trade needs from enquiry to completion.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link href="/auth/register" className="public-button public-button--primary group">Register your company <FiArrowRight className="transition-transform group-hover:translate-x-1" /></Link>
                  <a href="#choose-path" className="public-button public-button--secondary">Find your company&apos;s role</a>
                </div>
                <p className="max-w-3xl text-sm leading-6 text-foreground/60">
                  Associate accounts belong to companies. If you are joining as an individual to build relationships and coordinate execution, explore the <Link href="/roles/operator" className="font-bold text-orange-500 underline underline-offset-4">Operator role</Link>.
                </p>
              </div>
            </div>
          </section>

          <section id="choose-path" aria-labelledby="participation-heading" className="public-standard-section border-y border-default-200/60 bg-content1/30 scroll-mt-24">
            <div className="container mx-auto max-w-7xl px-4 public-layout-container">
              <div className="mb-10 max-w-3xl">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">Start with your purpose</span>
                <h2 id="participation-heading" className="mt-3 text-3xl font-black tracking-tight md:text-5xl">How will your company participate?</h2>
                <p className="mt-4 text-lg leading-8 text-foreground/65">Choose the path that reflects what the registered business actually does. Service companies select their specific capabilities during onboarding.</p>
              </div>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4" data-testid="associate-participation-paths">
                {participationPaths.map((path, index) => (
                  <div key={path.key} className="public-surface-card rounded-3xl border border-default-200/70 bg-background p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">{path.icon}</div>
                      <span className="text-xs font-black text-foreground/25">0{index + 1}</span>
                    </div>
                    <h3 className="text-xl font-bold">{path.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-foreground/60">{path.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="directory" aria-labelledby="directory-heading" className="public-standard-section">
            <div className="container mx-auto max-w-7xl px-4 public-layout-container">
              <div className="mb-14 max-w-3xl">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">Business categories</span>
                <h2 id="directory-heading" className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Find the role that matches your business</h2>
                <p className="mt-4 text-lg leading-8 text-foreground/65">Each page explains who qualifies, what the company is responsible for, how the workflow operates, and what is needed to register.</p>
              </div>
              <div className="space-y-16">
                {associateRoleGroups.map((group) => {
                  const groupRoles = getAssociateRolesByGroup(group.key);
                  return (
                    <section key={group.key} aria-labelledby={`group-${group.key}`} data-associate-group={group.key}>
                      <div className="mb-7 border-l-4 border-orange-500 pl-5">
                        <h3 id={`group-${group.key}`} className="text-2xl font-black md:text-3xl">{group.label}</h3>
                        <p className="mt-2 max-w-3xl text-foreground/60">{group.description}</p>
                      </div>
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {groupRoles.map((role) => (
                          <Link key={role.slug} href={getAssociateRolePath(role.slug)} data-testid="associate-role-card" className="public-surface-card group flex h-full flex-col rounded-[1.75rem] border border-default-200/70 bg-content1/35 p-7 transition-all hover:-translate-y-1 hover:border-orange-500/40 focus:outline-none focus:ring-2 focus:ring-orange-500">
                            <div className="mb-6 flex items-start justify-between gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 transition-colors group-hover:bg-orange-500 group-hover:text-white">{iconByRoleKey[role.iconKey]}</div>
                              <div className="flex flex-wrap justify-end gap-1.5">
                                {role.participationModes.map((mode) => <span key={mode} className="rounded-full bg-default-100 px-2.5 py-1 text-[9px] font-black tracking-wider text-foreground/55">{mode === "SERVICE" ? "SERVICES" : mode}</span>)}
                              </div>
                            </div>
                            <h4 className="text-xl font-bold">{role.displayName}</h4>
                            <p className="mt-3 text-sm leading-6 text-foreground/65">{role.shortDescription}</p>
                            <ul className="mt-5 space-y-2" data-testid="associate-card-features" aria-label={`${role.displayName} features`}>
                              {role.cardFeatures.map((feature) => <li key={feature} className="flex items-start gap-2 text-sm leading-6 text-foreground/70"><FiCheckCircle className="mt-1 shrink-0 text-success" />{feature}</li>)}
                            </ul>
                            <div className="mt-5 rounded-2xl bg-background/70 p-4">
                              <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">Best for</p>
                              <p className="mt-2 text-sm leading-6 text-foreground/70">{role.bestFor}</p>
                            </div>
                            <div className="mt-auto flex items-center gap-2 pt-6 text-xs font-black uppercase tracking-wider text-orange-500">View features for {role.displayName} <FiArrowRight className="transition-transform group-hover:translate-x-1" /></div>
                          </Link>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
          </section>

          <section aria-labelledby="associate-or-operator" className="public-standard-section border-y border-default-200/60 bg-foreground/[0.025]">
            <div className="container mx-auto grid max-w-6xl gap-6 px-4 public-layout-container md:grid-cols-2">
              <div className="public-surface-card rounded-[2rem] border border-orange-500/25 bg-background p-8">
                <FiBriefcase className="mb-5 text-3xl text-orange-500" />
                <p className="text-xs font-black uppercase tracking-widest text-orange-500">Choose Associate</p>
                <h2 id="associate-or-operator" className="mt-3 text-3xl font-black">You represent a registered company</h2>
                <ul className="mt-6 space-y-3 text-sm text-foreground/70">
                  {["The account belongs to the business", "You can provide company and legal details", "The company buys, sells, or provides trade services"].map((item) => <li key={item} className="flex gap-3"><FiCheckCircle className="mt-0.5 shrink-0 text-orange-500" />{item}</li>)}
                </ul>
                <Link href="/auth/register" className="public-button public-button--primary mt-8">Register an Associate company <FiArrowRight /></Link>
              </div>
              <div className="public-surface-card rounded-[2rem] border border-default-200/70 bg-background p-8">
                <FiUsers className="mb-5 text-3xl text-foreground/50" />
                <p className="text-xs font-black uppercase tracking-widest text-foreground/45">Choose Operator</p>
                <h2 className="mt-3 text-3xl font-black">You are joining as an individual</h2>
                <p className="mt-6 leading-7 text-foreground/65">Operators are individuals who build business relationships, manage supplier portfolios, and help keep execution moving. They do not register as the trading or service company.</p>
                <Link href="/roles/operator" className="public-button public-button--secondary mt-8">Explore the Operator role <FiArrowRight /></Link>
              </div>
            </div>
          </section>

          <section className="public-standard-section text-center">
            <div className="container mx-auto max-w-3xl px-4 public-layout-container">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-2xl text-orange-500"><FiShield /></div>
              <h2 className="text-3xl font-black md:text-5xl">Register the business behind the work.</h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-foreground/65">Tell us how your company participates, provide its legal and operating details, and select the capabilities that should shape its OBAOL workspace.</p>
              <Link href="/auth/register" className="public-button public-button--primary mt-8">Start company registration <FiArrowRight /></Link>
            </div>
          </section>
        </main>
      </ThemedContentWrapper>
      <Footer />
    </section>
  );
}
