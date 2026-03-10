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

const isLocalOrigin = (value) => {
  if (!value) return false;
  try {
    const url = new URL(value);
    return ["localhost", "127.0.0.1"].includes(url.hostname);
  } catch {
    return false;
  }
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  async rewrites() {
    const isProd = process.env.NODE_ENV === "production";
    const configuredOrigin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN;
    const backendOrigin = isProd
      ? configuredOrigin || "https://automate-backend.infra.obaol.com"
      : isLocalOrigin(configuredOrigin)
      ? configuredOrigin
      : "http://localhost:5001";
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
