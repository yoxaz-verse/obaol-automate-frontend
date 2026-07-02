import { buildMetadata } from "@/utils/seo";

export const metadata = buildMetadata({
  title: "Associate Trade Directory | OBAOL Supreme",
  description: "Explore commodities currently supported by active, verified OBAOL Associate trade listings. OBAOL coordinates execution and does not own or sell the commodities shown.",
  keywords: ["associate trade directory", "verified commodity traders", "agro commodity directory", "commodity execution India"],
  path: "/trade-directory",
});

export default function TradeDirectoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
