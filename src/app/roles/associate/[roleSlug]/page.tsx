import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import ThemedContentWrapper from "@/components/layout/ThemedContentWrapper";
import { buildMetadata, buildWebPageJsonLd } from "@/utils/seo";
import {
  associateRoleSlugs,
  getAssociateRoleBySlug,
  getAssociateRolePath,
} from "@/data/associateRoles";
import { 
  FiArrowLeft, 
  FiCheckCircle, 
  FiShield, 
  FiTarget, 
  FiArrowRight, 
  FiHelpCircle 
} from "react-icons/fi";

type Params = { roleSlug: string };

const iconClassByKey: Record<string, string> = {
  trader: "bg-orange-500/10 border-orange-500/20 text-orange-500",
  importer: "bg-amber-500/10 border-amber-500/20 text-amber-500",
  exporter: "bg-lime-500/10 border-lime-500/20 text-lime-500",
  warehouse: "bg-cyan-500/10 border-cyan-500/20 text-cyan-500",
  inlandTransport: "bg-sky-500/10 border-sky-500/20 text-sky-500",
  freightForwarder: "bg-indigo-500/10 border-indigo-500/20 text-indigo-500",
  logistics: "bg-blue-500/10 border-blue-500/20 text-blue-500",
  supplier: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
  packaging: "bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-500",
  qualityLab: "bg-violet-500/10 border-violet-500/20 text-violet-500",
  agritech: "bg-green-500/10 border-green-500/20 text-green-500",
  customs: "bg-rose-500/10 border-rose-500/20 text-rose-500",
  finance: "bg-yellow-500/10 border-yellow-500/20 text-yellow-500",
  procurement: "bg-teal-500/10 border-teal-500/20 text-teal-500",
};

export function generateStaticParams() {
  return associateRoleSlugs.map((roleSlug) => ({ roleSlug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const role = getAssociateRoleBySlug(params.roleSlug);
  if (!role) {
    return buildMetadata({
      title: "Associate Role | OBAOL Supreme",
      description:
        "Explore associate role categories on OBAOL Supreme, including traders, logistics partners, labs, and agritech collaborators.",
      path: "/roles/associate",
    });
  }

  return buildMetadata({
    title: role.seo.title,
    description: role.seo.description,
    keywords: role.seo.keywords,
    path: getAssociateRolePath(role.slug),
    type: "article",
  });
}

export default function AssociateRoleDetailPage({ params }: { params: Params }) {
  const role = getAssociateRoleBySlug(params.roleSlug);
  if (!role) notFound();

  const relatedRoles = role.relatedRoles
    .map((slug) => getAssociateRoleBySlug(slug))
    .filter(Boolean);

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
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Roles",
        item: "https://obaol.com/roles",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Associate",
        item: "https://obaol.com/roles/associate",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: role.displayName,
        item: `https://obaol.com${getAssociateRolePath(role.slug)}`,
      },
    ],
  };

  const badgeClass = iconClassByKey[role.iconKey] || "bg-orange-500/10 border-orange-500/20 text-orange-500";

  return (
    <section className="min-h-screen bg-background selection:bg-orange-500/30 text-foreground overflow-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      
      <Header />
      
      <main className="relative pt-32 pb-24">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-6xl px-6 relative z-10 space-y-20">
          
          {/* Header Section */}
          <div className="space-y-8">
            <Link
              href="/roles/associate"
              className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/50 hover:text-orange-500 transition-colors group px-4 py-2 rounded-full border border-divider bg-content1/30 backdrop-blur-sm"
            >
              <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              Back to Associate Directory
            </Link>

            <div className="space-y-6 max-w-4xl">
              <div className={`inline-flex px-4 py-1.5 rounded-full border text-xs font-bold tracking-[0.2em] uppercase backdrop-blur-md ${badgeClass}`}>
                Associate Ecosystem Role
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">
                {role.displayName} <br className="hidden md:block"/>
                <span className="font-light italic truncate text-foreground/50">on OBAOL</span>
              </h1>
              <p className="text-xl md:text-2xl text-foreground/60 leading-relaxed font-light">
                {role.longDescription}
              </p>
            </div>
          </div>

          {/* Value Proposition Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-10 rounded-[2.5rem] border border-divider hover:border-orange-500/30 transition-colors bg-gradient-to-br from-content1/60 to-background shadow-lg group relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 text-foreground-[0.03] group-hover:text-orange-500/10 transition-colors pointer-events-none">
                 <FiTarget className="w-32 h-32" />
               </div>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary/10 text-primary rounded-2xl relative z-10">
                  <FiTarget className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight relative z-10">Role Scope</h2>
              </div>
              <ul className="space-y-5 relative z-10">
                {role.roleScope.map((scope) => (
                  <li key={scope} className="flex items-start gap-4 text-foreground/80 text-lg">
                    <FiCheckCircle className="text-primary w-6 h-6 shrink-0 mt-0.5" />
                    <span>{scope}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-10 rounded-[2.5rem] border border-divider hover:border-success/30 transition-colors bg-gradient-to-bl from-content1/60 to-background shadow-lg group relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 text-foreground-[0.03] group-hover:text-success/10 transition-colors pointer-events-none">
                 <FiShield className="w-32 h-32" />
               </div>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-success/10 text-success rounded-2xl relative z-10">
                  <FiShield className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight relative z-10">Platform Support</h2>
              </div>
              <ul className="space-y-5 relative z-10">
                {role.supportPoints.map((support) => (
                  <li key={support} className="flex items-start gap-4 text-foreground/80 text-lg">
                    <FiCheckCircle className="text-success w-6 h-6 shrink-0 mt-0.5" />
                    <span>{support}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-foreground/5 text-foreground/60 rounded-xl">
                 <FiHelpCircle className="w-6 h-6" />
               </div>
               <h2 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {role.faqs.map((faq) => (
                <div key={faq.question} className="p-8 rounded-[2rem] border border-divider bg-content1/30 hover:bg-content1 transition-colors">
                  <h3 className="font-bold text-xl mb-3 leading-tight">{faq.question}</h3>
                  <p className="text-foreground/60 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Related Roles */}
          {relatedRoles.length > 0 && (
            <div className="pt-10 border-t border-divider space-y-10">
              <h2 className="text-3xl font-bold tracking-tight">Explore Related Roles</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedRoles.map((relatedRole) => (
                  <Link
                    key={relatedRole.slug}
                    href={getAssociateRolePath(relatedRole.slug)}
                    className="p-6 rounded-3xl border border-divider bg-content1/20 hover:bg-content1 hover:border-orange-500/40 hover:-translate-y-1 hover:shadow-xl transition-all group focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <div className="flex items-center justify-between mb-4">
                       <span className="font-bold text-lg">{relatedRole.displayName}</span>
                       <FiArrowRight className="text-orange-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </div>
                    <p className="text-sm text-foreground/60 leading-relaxed line-clamp-2">
                      {relatedRole.shortDescription}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA Footer */}
          <div className="pt-16 pb-8 text-center flex flex-col items-center">
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent mb-12" />
            <h2 className="text-4xl font-bold mb-8">Execute With Precision</h2>
            <Link
              href="/auth"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-[2rem] bg-orange-600 text-white font-bold text-lg hover:bg-orange-700 hover:scale-[1.02] shadow-[0_10px_30px_-10px_rgba(234,88,12,0.5)] transition-all group"
            >
              Join as Associate
              <FiArrowRight className="group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>

        </div>
      </main>
      
      <Footer />
    </section>
  );
}
