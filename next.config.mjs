import createMDX from "@next/mdx";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const withBundleAnalyzer = (() => {
  try {
    const nextBundleAnalyzer = require("@next/bundle-analyzer");
    return nextBundleAnalyzer({
      enabled: process.env.ANALYZE === "true",
    });
  } catch {
    return (config) => config;
  }
})();

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  async rewrites() {
    const backendOrigin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:5001";
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "",
        pathname: "/upload/**",
      },
      {
        protocol: "https",
        hostname: "activity-tracking-backend-m5o1.onrender.com",
        port: "",
        pathname: "/upload/**",
      },
    ],
    domains: ["localhost"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withBundleAnalyzer(withMDX(nextConfig));
