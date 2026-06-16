import { AuthenticatedProviders } from "@/app/authenticated-provider";

export default function CommissionStructureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedProviders>{children}</AuthenticatedProviders>;
}
