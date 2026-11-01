import { buildMetadata } from "@/utils/seo";

export const metadata = buildMetadata({
  title: "Trade Relationship and Execution Methods | OBAOL Supreme",
  description:
    "Review OBAOL relationship methods for enquiry-led engagement, commodity knowledge, regional context, and accountable trade coordination.",
  keywords: ["trade relationship methods", "commodity trade coordination", "trade enquiry engagement"],
  path: "/methods",
});

export default function MethodsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
