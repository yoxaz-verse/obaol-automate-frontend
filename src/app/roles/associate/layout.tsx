import { buildMetadata } from "@/utils/seo";

export const metadata = buildMetadata({
    title: "Associate Businesses on OBAOL | Who Can Join",
    description:
        "See how verified companies join OBAOL to buy commodities, sell commodities, or provide services across trade execution.",
    keywords: [
        "OBAOL associate businesses",
        "verified commodity companies",
        "buy and sell commodities",
        "warehouse companies on OBAOL",
        "trade execution platform roles",
        "logistics associate",
        "procurement partner",
        "packaging company",
        "quality testing labs",
        "agritech companies",
        "inland transportation",
        "freight forwarders",
        "importers",
        "exporters",
        "customs clearance",
        "who can be associate",
    ],
    path: "/roles/associate",
});

export default function AssociateRoleLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
