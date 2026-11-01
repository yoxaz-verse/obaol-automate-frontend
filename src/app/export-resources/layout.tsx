import { buildMetadata } from "@/utils/seo";

export const metadata = buildMetadata({
  title: "Export Resources for Indian Commodity Trade | OBAOL Supreme",
  description:
    "Access official Indian export, compliance, logistics, and agricultural commodity trade resources curated for operational reference.",
  keywords: ["India export resources", "commodity export compliance", "agricultural export resources"],
  path: "/export-resources",
});

export default function ExportResourcesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
