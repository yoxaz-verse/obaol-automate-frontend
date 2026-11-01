import type { Metadata } from "next";
import { AuthenticatedProviders } from "@/app/authenticated-provider";

export const metadata: Metadata = {
  title: "Secure Shared Document | OBAOL Supreme",
  robots: { index: false, follow: false, nocache: true },
};

export default function SharedDocumentsLayout({ children }: { children: React.ReactNode }) {
  return <AuthenticatedProviders>{children}</AuthenticatedProviders>;
}
