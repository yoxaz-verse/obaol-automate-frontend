import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shared offering on OBAOL",
  description: "View current product or service details shared through the OBAOL trade network.",
  openGraph: { title: "Shared offering on OBAOL", description: "View current product or service details on OBAOL.", type: "website" },
};

export default function ShareLayout({ children }: { children: React.ReactNode }) { return children; }
