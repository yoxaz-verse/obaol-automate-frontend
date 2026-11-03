import type { Metadata } from "next";
import OperatorRolePageClient from "./OperatorRolePageClient";
import { getPublishedRoleScenarios } from "@/data/realLifeScenarios";
import { buildMetadata } from "@/utils/seo";

export const metadata: Metadata = buildMetadata({
  title: "Operator Role | OBAOL Supreme",
  description: "Learn how OBAOL Operators qualify commodity opportunities, align companies, coordinate execution milestones, and maintain accountable trade records.",
  path: "/roles/operator",
  keywords: ["commodity trade operator", "trade execution operator", "bulk trade coordination"],
});

export const dynamic = "force-dynamic";

export default async function OperatorRolePage() {
  const scenarios = await getPublishedRoleScenarios("operator");
  return <OperatorRolePageClient scenarios={scenarios} />;
}
