import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ScenarioPageView from "@/components/public/ScenarioPageView";
import { getAssociateRoleBySlug, getAssociateRolePath } from "@/data/associateRoles";
import { getPublishedRoleScenarios, getPublishedScenario } from "@/data/realLifeScenarios";
import { BASE_URL, buildMetadata } from "@/utils/seo";

type Params = { roleSlug: string; storySlug: string };
const storyPath = ({ roleSlug, storySlug }: Params) => `${getAssociateRolePath(roleSlug)}/real-life-scenarios/${storySlug}`;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const scenario = await getPublishedScenario(params.roleSlug, params.storySlug);
  if (!scenario) return { title: "Scenario not found | OBAOL", robots: { index: false, follow: false } };
  return buildMetadata({
    title: scenario.seoTitle,
    description: scenario.seoDescription,
    keywords: [scenario.primaryKeyword, ...(scenario.supportingKeywords || [])],
    path: storyPath(params), image: scenario.heroImageUrl || undefined, type: "article",
  });
}

export default async function RealLifeScenarioPage({ params }: { params: Params }) {
  const [scenario, related] = await Promise.all([getPublishedScenario(params.roleSlug, params.storySlug), getPublishedRoleScenarios(params.roleSlug)]);
  const role = getAssociateRoleBySlug(params.roleSlug);
  if (!scenario || !role) notFound();
  const url = `${BASE_URL}${storyPath(params)}`;
  const articleJsonLd = { "@context": "https://schema.org", "@type": "Article", headline: scenario.h1, description: scenario.seoDescription, url, datePublished: scenario.publishedAt, dateModified: scenario.updatedAt, author: { "@type": "Organization", name: "OBAOL Supreme" }, publisher: { "@type": "Organization", name: "OBAOL Supreme", url: BASE_URL }, image: scenario.heroImageUrl || `${BASE_URL}/social/obaol-share-v2.png`, about: { "@type": "Thing", name: role.displayName }, articleSection: "Representative real-life scenario", isBasedOn: "Common industry challenges; not a customer testimonial or verified case study." };
  const breadcrumbJsonLd = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Associate roles", item: `${BASE_URL}/roles/associate` },
    { "@type": "ListItem", position: 2, name: role.displayName, item: `${BASE_URL}${getAssociateRolePath(role.slug)}` },
    { "@type": "ListItem", position: 3, name: scenario.h1, item: url },
  ] };
  const faqJsonLd = scenario.faqs?.length ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: scenario.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) } : null;
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}
    <ScenarioPageView scenario={scenario} related={related} />
  </>;
}
