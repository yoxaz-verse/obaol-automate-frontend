import { AuthenticatedProviders } from "@/app/authenticated-provider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verification Pending",
  robots: { index: false, follow: false, nocache: true },
};

export default function VerificationPendingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedProviders>{children}</AuthenticatedProviders>;
}
