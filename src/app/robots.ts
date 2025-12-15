// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
        //   "/product",
        //   "/case-studies",
        //   "/insights",
        ],
        disallow: [
          "/auth",
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
