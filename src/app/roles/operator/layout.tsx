import { buildMetadata } from "@/utils/seo";

export const metadata = buildMetadata({
    title: "Operator Role | OBAOL Supreme",
    description:
        "Starting in India, learn who can become an Operator on OBAOL Supreme and how operators manage supplier portfolios, relationships, and execution support as we expand globally.",
    keywords: [
        "operator role",
        "platform operator",
        "company coordination",
        "trade execution operator",
        "operations management",
        "OBAOL operator",
        "who can be operator",
        "digital trader",
        "commission agent",
        "supplier relationship manager",
    ],
    path: "/roles/operator",
});

export default function OperatorRoleLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
