// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/about",
          "/why-obaol",
          "/how-it-works",
          "/procurement",
          "/verification",
          "/export-resources",
          "/news",
          "/roles",
          "/roles/associate",
          "/roles/associate/",
          "/roles/operator",
          "/product",
          "/brand",
          "/companies",
          "/obaol",
          "/faq",
          "/privacy-policy",
          "/terms-and-conditions",
          "/disclaimer",
        ],
        disallow: [
          "/auth",
          "/developer",
          "/developer/*",
          "/dashboard",
          "/dashboard/*",
          "/api",
          "/api/*",
        ],
      },
    ],
    sitemap: "https://obaol.com/sitemap.xml",
  };
}
