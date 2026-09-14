// app/sitemap.ts
import { MetadataRoute } from "next";
import { buildPublicWebApiUrl } from "@/utils/publicApi";
import { associateRoleSlugs, getAssociateRolePath } from "@/data/associateRoles";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://obaol.com";
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, priority: 1, changeFrequency: "weekly", lastModified },
    { url: `${baseUrl}/about`, priority: 0.9, changeFrequency: "monthly", lastModified },
    { url: `${baseUrl}/why-obaol`, priority: 0.9, changeFrequency: "monthly", lastModified },
    { url: `${baseUrl}/how-it-works`, priority: 0.9, changeFrequency: "monthly", lastModified },
    { url: `${baseUrl}/quick-commerce-procurement`, priority: 0.9, changeFrequency: "weekly", lastModified },
    { url: `${baseUrl}/procurement`, priority: 0.8, changeFrequency: "monthly", lastModified },
    { url: `${baseUrl}/verification`, priority: 0.8, changeFrequency: "monthly", lastModified },
    { url: `${baseUrl}/export-resources`, priority: 0.8, changeFrequency: "monthly", lastModified },
    { url: `${baseUrl}/roles`, priority: 0.7, changeFrequency: "monthly", lastModified },
    { url: `${baseUrl}/roles/associate`, priority: 0.7, changeFrequency: "monthly", lastModified },
    { url: `${baseUrl}/roles/operator`, priority: 0.7, changeFrequency: "monthly", lastModified },
    { url: `${baseUrl}/faq`, priority: 0.7, changeFrequency: "monthly", lastModified },
    { url: `${baseUrl}/trade-finance`, priority: 0.8, changeFrequency: "monthly", lastModified },
    { url: `${baseUrl}/privacy-policy`, priority: 0.5, changeFrequency: "yearly", lastModified },
    { url: `${baseUrl}/terms-and-conditions`, priority: 0.5, changeFrequency: "yearly", lastModified },
    { url: `${baseUrl}/disclaimer`, priority: 0.4, changeFrequency: "yearly", lastModified },
    { url: `${baseUrl}/trust`, priority: 0.6, changeFrequency: "monthly", lastModified },
  ];

  const associateRoleEntries: MetadataRoute.Sitemap = associateRoleSlugs.map((slug) => ({
    url: `${baseUrl}${getAssociateRolePath(slug)}`,
    priority: 0.65,
    changeFrequency: "monthly",
    lastModified,
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
      .filter(Boolean)
      .map((slug: string) => ({
        url: `${baseUrl}/brand/${slug}`,
        priority: 0.6,
        changeFrequency: "monthly" as const,
        lastModified,
      }));

    return [...staticEntries, ...associateRoleEntries, ...brandEntries];
  } catch {
    return [...staticEntries, ...associateRoleEntries];
  }
}
