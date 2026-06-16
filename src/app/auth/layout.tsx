import type { Metadata } from "next";
import { AuthenticatedProviders } from "@/app/authenticated-provider";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthRouteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthenticatedProviders>{children}</AuthenticatedProviders>;
}
