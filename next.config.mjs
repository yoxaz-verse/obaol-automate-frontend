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
  async headers() {
    const isProd = process.env.NODE_ENV === "production";
    const connectSrc = isProd
      ? "connect-src 'self' https: wss:"
      : "connect-src 'self' https: http://localhost:5001 http://127.0.0.1:5001 ws: wss:";

    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https:",
      "style-src 'self' 'unsafe-inline' https:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
      connectSrc,
      "frame-src 'self' https:",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
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
  async redirects() {
    return [
      {
        source: "/roles/associate/finance-insurance-partners",
        destination: "/roles/associate/finance-partners",
        permanent: true,
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
    ignoreDuringBuilds: false,
  },
};

export default withBundleAnalyzer(withMDX(nextConfig));
