// app/sitemap.ts
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://obaol.com";

  return [
    { url: `${baseUrl}/`, priority: 1 },
    { url: `${baseUrl}/about`, priority: 0.9 },
    { url: `${baseUrl}/why-obaol`, priority: 0.9 },
    { url: `${baseUrl}/how-it-works`, priority: 0.9 },
    { url: `${baseUrl}/procurement`, priority: 0.8 },
    { url: `${baseUrl}/verification`, priority: 0.8 },
    { url: `${baseUrl}/faq`, priority: 0.7 },
    { url: `${baseUrl}/privacy-policy`, priority: 0.5 },
    { url: `${baseUrl}/terms`, priority: 0.5 },
  ];
}
