import { buildMetadata } from "@/utils/seo";

export const metadata = buildMetadata({
    title: "Associate Role | OBAOL Supreme",
    description:
        "Starting in India, learn who can become an Associate on OBAOL Supreme, including traders, warehouses, logistics, procurement, and packaging companies as we expand globally.",
    keywords: [
        "associate role",
        "warehouse companies on OBAOL",
        "trade execution platform roles",
        "logistics associate",
        "procurement partner",
        "packaging company",
        "customs clearance",
        "who can be associate",
    ],
    path: "/roles/associate",
});

export default function AssociateRoleLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
