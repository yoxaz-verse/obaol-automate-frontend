import { buildMetadata } from "@/utils/seo";

export const metadata = buildMetadata({
    title: "Roles on OBAOL Supreme | Operator vs Associate",
    description:
        "Starting in India, understand the difference between Operators and Associates on OBAOL Supreme. Choose the right role to join the trade execution platform as we expand globally.",
    keywords: [
        "operator vs associate",
        "roles on OBAOL",
        "trade execution platform roles",
        "who can be associate",
        "who can be operator",
    ],
    path: "/roles",
});

export default function RolesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
