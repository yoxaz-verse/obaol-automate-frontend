import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ScenarioPageView from "@/components/public/ScenarioPageView";
import { getScenarioPreview } from "@/data/realLifeScenarios";

export const metadata: Metadata = { title: "Scenario preview | OBAOL", robots: { index: false, follow: false, nocache: true } };

export default async function ScenarioPreviewPage({ params, searchParams }: { params: { roleSlug: string; id: string }; searchParams: { token?: string } }) {
  const scenario = searchParams.token ? await getScenarioPreview(params.id, searchParams.token) : null;
  if (!scenario || scenario.roleSlug !== params.roleSlug) notFound();
  return <ScenarioPageView scenario={scenario} preview />;
}
