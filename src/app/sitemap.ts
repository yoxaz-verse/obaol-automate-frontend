// app/sitemap.ts
import { MetadataRoute } from "next";
import { buildPublicWebApiUrl } from "@/utils/publicApi";
import { associateRoleSlugs, getAssociateRolePath } from "@/data/associateRoles";
import { BASE_URL } from "@/utils/seo";
import { getAllPublishedScenarios } from "@/data/realLifeScenarios";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = BASE_URL;
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, priority: 1, changeFrequency: "weekly" },
    { url: `${baseUrl}/about`, priority: 0.9, changeFrequency: "monthly" },
    { url: `${baseUrl}/why-obaol`, priority: 0.9, changeFrequency: "monthly" },
    { url: `${baseUrl}/how-it-works`, priority: 0.9, changeFrequency: "monthly" },
    { url: `${baseUrl}/quick-commerce-procurement`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${baseUrl}/procurement`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${baseUrl}/verification`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${baseUrl}/export-resources`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${baseUrl}/commission-structure`, priority: 0.6, changeFrequency: "monthly" },
    { url: `${baseUrl}/methods`, priority: 0.6, changeFrequency: "monthly" },
    { url: `${baseUrl}/roles`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${baseUrl}/roles/associate`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${baseUrl}/roles/operator`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${baseUrl}/faq`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${baseUrl}/trade-finance`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${baseUrl}/privacy-policy`, priority: 0.5, changeFrequency: "yearly" },
    { url: `${baseUrl}/terms-and-conditions`, priority: 0.5, changeFrequency: "yearly" },
    { url: `${baseUrl}/disclaimer`, priority: 0.4, changeFrequency: "yearly" },
    { url: `${baseUrl}/trust`, priority: 0.6, changeFrequency: "monthly" },
  ];

  const associateRoleEntries: MetadataRoute.Sitemap = associateRoleSlugs.map((slug) => ({
    url: `${baseUrl}${getAssociateRolePath(slug)}`,
    priority: 0.65,
    changeFrequency: "monthly",
  }));

  const scenarios = await getAllPublishedScenarios();
  const scenarioEntries: MetadataRoute.Sitemap = scenarios.map((scenario) => ({
    url: `${baseUrl}${getAssociateRolePath(scenario.roleSlug)}/real-life-scenarios/${scenario.slug}`,
    lastModified: scenario.updatedAt ? new Date(scenario.updatedAt) : undefined,
    priority: 0.6,
    changeFrequency: "monthly" as const,
  }));

  try {
    const companiesRes = await fetch(
      buildPublicWebApiUrl("/associate-companies?limit=2000&fields=slug,subdomain,customDomain"),
      { cache: "no-store" }
    );
    const companiesBody = companiesRes.ok ? await companiesRes.json() : null;
    const companyRows = Array.isArray(companiesBody?.data?.data)
      ? companiesBody.data.data
      : Array.isArray(companiesBody?.data)
        ? companiesBody.data
        : [];

    const brandEntries: MetadataRoute.Sitemap = companyRows
      .map((row: any) => String(row?.slug || row?.subdomain || "").trim())
      .filter((slug: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
      .map((slug: string) => ({
        url: `${baseUrl}/brand/${slug}`,
        priority: 0.6,
        changeFrequency: "monthly" as const,
      }));

    return [...staticEntries, ...associateRoleEntries, ...scenarioEntries, ...brandEntries];
  } catch {
    return [...staticEntries, ...associateRoleEntries, ...scenarioEntries];
  }
}
