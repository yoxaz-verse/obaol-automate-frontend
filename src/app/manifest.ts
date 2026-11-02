import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OBAOL Supreme",
    short_name: "OBAOL",
    description: "Commodity trade execution workspace for discovery, coordination, orders, documents, and operations.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#eee9df",
    theme_color: "#1b2632",
    categories: ["business", "productivity"],
    id: "/dashboard",
    prefer_related_applications: false,
    shortcuts: [
      { name: "Workspace", short_name: "Workspace", url: "/dashboard", icons: [{ src: "/icons/obaol-icon-v2-192.png", sizes: "192x192" }] },
      { name: "Marketplace", short_name: "Market", url: "/dashboard/marketplace", icons: [{ src: "/icons/obaol-icon-v2-192.png", sizes: "192x192" }] },
      { name: "Enquiries", short_name: "Enquiries", url: "/dashboard/enquiries", icons: [{ src: "/icons/obaol-icon-v2-192.png", sizes: "192x192" }] },
    ],
    icons: [
      {
        src: "/icons/obaol-icon-v2-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/obaol-icon-v2-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/obaol-icon-maskable-v2-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/obaol-icon-maskable-v2-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
