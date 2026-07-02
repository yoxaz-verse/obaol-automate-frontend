import { buildMetadata } from "@/utils/seo";

export const metadata = buildMetadata({
  title: "Commodity Catalog | OBAOL Supreme",
  description: "Explore commodities currently available through verified participants on OBAOL. OBAOL coordinates execution and does not own or sell the commodities shown.",
  keywords: ["commodity catalog", "verified commodity traders", "agro commodity directory", "commodity execution India"],
  path: "/trade-directory",
});

export default function TradeDirectoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
