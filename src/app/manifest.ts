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
    background_color: "#fcfaf6",
    theme_color: "#cf983c",
    categories: ["business", "productivity"],
    id: "/dashboard",
    prefer_related_applications: false,
    shortcuts: [
      { name: "Workspace", short_name: "Workspace", url: "/dashboard", icons: [{ src: "/pwa/icon-192.png", sizes: "192x192" }] },
      { name: "Marketplace", short_name: "Market", url: "/dashboard/marketplace", icons: [{ src: "/pwa/icon-192.png", sizes: "192x192" }] },
      { name: "Enquiries", short_name: "Enquiries", url: "/dashboard/enquiries", icons: [{ src: "/pwa/icon-192.png", sizes: "192x192" }] },
    ],
    icons: [
      {
        src: "/pwa/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/pwa/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
