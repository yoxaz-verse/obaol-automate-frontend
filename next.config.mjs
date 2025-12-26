import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],

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
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

export default withMDX(nextConfig);
