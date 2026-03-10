// app/sitemap.ts
import { MetadataRoute } from "next";
import { buildPublicWebApiUrl } from "@/utils/publicApi";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://obaol.com";
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, priority: 1, changeFrequency: "weekly", lastModified },
    { url: `${baseUrl}/about`, priority: 0.9, changeFrequency: "monthly", lastModified },
    { url: `${baseUrl}/why-obaol`, priority: 0.9, changeFrequency: "monthly", lastModified },
    { url: `${baseUrl}/how-it-works`, priority: 0.9, changeFrequency: "monthly", lastModified },
    { url: `${baseUrl}/procurement`, priority: 0.8, changeFrequency: "monthly", lastModified },
    { url: `${baseUrl}/verification`, priority: 0.8, changeFrequency: "monthly", lastModified },
    { url: `${baseUrl}/export-resources`, priority: 0.8, changeFrequency: "monthly", lastModified },
    { url: `${baseUrl}/companies`, priority: 0.8, changeFrequency: "monthly", lastModified },
    { url: `${baseUrl}/obaol`, priority: 0.7, changeFrequency: "monthly", lastModified },
    { url: `${baseUrl}/product`, priority: 0.8, changeFrequency: "daily", lastModified },
    { url: `${baseUrl}/faq`, priority: 0.7, changeFrequency: "monthly", lastModified },
    { url: `${baseUrl}/privacy-policy`, priority: 0.5, changeFrequency: "yearly", lastModified },
    { url: `${baseUrl}/terms-and-conditions`, priority: 0.5, changeFrequency: "yearly", lastModified },
    { url: `${baseUrl}/disclaimer`, priority: 0.4, changeFrequency: "yearly", lastModified },
  ];

  try {
    const res = await fetch(buildPublicWebApiUrl("/products?limit=1000&fields=slug"), { cache: "no-store" });
    if (!res.ok) return staticEntries;

    const body = await res.json();
    const rows = Array.isArray(body?.data?.data) ? body.data.data : Array.isArray(body?.data) ? body.data : [];
    const productEntries: MetadataRoute.Sitemap = rows
      .map((row: any) => String(row?.slug || "").trim())
      .filter(Boolean)
      .map((slug: string) => ({
        url: `${baseUrl}/product/${slug}`,
        priority: 0.7,
        changeFrequency: "weekly" as const,
        lastModified,
      }));

    return [...staticEntries, ...productEntries];
  } catch {
    return staticEntries;
  }
}
