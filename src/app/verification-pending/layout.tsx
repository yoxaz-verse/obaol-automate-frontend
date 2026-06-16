import { AuthenticatedProviders } from "@/app/authenticated-provider";

export default function VerificationPendingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedProviders>{children}</AuthenticatedProviders>;
}
