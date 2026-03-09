// app/sitemap.ts
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://obaol.com";
  const lastModified = new Date();

  return [
    { url: `${baseUrl}/`, priority: 1, changeFrequency: "weekly", lastModified },
    { url: `${baseUrl}/about`, priority: 0.9, changeFrequency: "monthly", lastModified },
    { url: `${baseUrl}/why-obaol`, priority: 0.9, changeFrequency: "monthly", lastModified },
    { url: `${baseUrl}/how-it-works`, priority: 0.9, changeFrequency: "monthly", lastModified },
    { url: `${baseUrl}/procurement`, priority: 0.8, changeFrequency: "monthly", lastModified },
    { url: `${baseUrl}/verification`, priority: 0.8, changeFrequency: "monthly", lastModified },
    { url: `${baseUrl}/export-resources`, priority: 0.8, changeFrequency: "monthly", lastModified },
    { url: `${baseUrl}/product`, priority: 0.8, changeFrequency: "daily", lastModified },
    { url: `${baseUrl}/faq`, priority: 0.7, changeFrequency: "monthly", lastModified },
    { url: `${baseUrl}/privacy-policy`, priority: 0.5, changeFrequency: "yearly", lastModified },
    { url: `${baseUrl}/terms-and-conditions`, priority: 0.5, changeFrequency: "yearly", lastModified },
    { url: `${baseUrl}/disclaimer`, priority: 0.4, changeFrequency: "yearly", lastModified },
  ];
}
