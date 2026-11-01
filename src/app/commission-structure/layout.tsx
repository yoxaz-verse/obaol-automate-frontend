import { AuthenticatedProviders } from "@/app/authenticated-provider";
import { buildMetadata } from "@/utils/seo";

export const metadata = buildMetadata({
  title: "Trade Execution Commission Structure | OBAOL Supreme",
  description:
    "Understand the commission framework described for OBAOL trade execution roles, completed trades, and operational contribution.",
  keywords: ["trade execution commission", "commodity trade commission structure"],
  path: "/commission-structure",
});

export default function CommissionStructureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedProviders>{children}</AuthenticatedProviders>;
}
