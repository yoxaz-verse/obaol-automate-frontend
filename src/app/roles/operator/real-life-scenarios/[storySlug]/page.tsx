import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ScenarioPageView from "@/components/public/ScenarioPageView";
import { getPublishedRoleScenarios, getPublishedScenario } from "@/data/realLifeScenarios";
import { getScenarioRolePath, getScenarioStoryPath } from "@/data/scenarioRoles";
import { BASE_URL, buildMetadata } from "@/utils/seo";

type Params = { storySlug: string };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const scenario = await getPublishedScenario("operator", params.storySlug);
  if (!scenario) return { title: "Scenario not found | OBAOL", robots: { index: false, follow: false } };
  return buildMetadata({
    title: scenario.seoTitle,
    description: scenario.seoDescription,
    keywords: [scenario.primaryKeyword, ...(scenario.supportingKeywords || [])],
    path: getScenarioStoryPath("operator", scenario.slug),
    image: scenario.heroImageUrl || undefined,
    type: "article",
  });
}

export default async function OperatorScenarioPage({ params }: { params: Params }) {
  const [scenario, related] = await Promise.all([
    getPublishedScenario("operator", params.storySlug),
    getPublishedRoleScenarios("operator"),
  ]);
  if (!scenario) notFound();

  const rolePath = getScenarioRolePath("operator");
  const url = `${BASE_URL}${getScenarioStoryPath("operator", scenario.slug)}`;
  const articleJsonLd = { "@context": "https://schema.org", "@type": "Article", headline: scenario.h1, description: scenario.seoDescription, url, datePublished: scenario.publishedAt, dateModified: scenario.updatedAt, author: { "@type": "Organization", name: "OBAOL Supreme" }, publisher: { "@type": "Organization", name: "OBAOL Supreme", url: BASE_URL }, image: scenario.heroImageUrl || `${BASE_URL}/social/obaol-share-v2.png`, about: { "@type": "Thing", name: "Operator" }, articleSection: "Industry scenario" };
  const breadcrumbJsonLd = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Operator role", item: `${BASE_URL}${rolePath}` },
    { "@type": "ListItem", position: 2, name: scenario.h1, item: url },
  ] };
  const faqJsonLd = scenario.faqs?.length ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: scenario.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) } : null;

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}
    <ScenarioPageView scenario={scenario} related={related} />
  </>;
}
