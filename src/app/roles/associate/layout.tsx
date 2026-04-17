import { buildMetadata } from "@/utils/seo";

export const metadata = buildMetadata({
    title: "Associate Role Directory | OBAOL Supreme",
    description:
        "Starting in India, explore the full Associate role directory on OBAOL Supreme, including traders, importers, exporters, warehouses, inland transportation, freight forwarding, quality labs, agritech, and more.",
    keywords: [
        "associate role directory",
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
