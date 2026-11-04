import type { Metadata } from "next";
import DeveloperNav from "@/components/developer/DeveloperNav";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function DeveloperRouteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <><DeveloperNav />{children}</>;
}

