import { buildMetadata } from "@/utils/seo";

export const metadata = buildMetadata({
  title: "Products | OBAOL Supreme",
  description:
    "Starting in India, explore agro-commodity products with verified sourcing and execution support as OBAOL expands globally.",
  keywords: [
    "agro commodities",
    "commodity products",
    "india commodity trade",
    "procurement marketplace",
    "verified sourcing",
  ],
  path: "/product",
});

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
