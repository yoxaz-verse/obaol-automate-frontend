import type { ReactNode } from "react";
import RoleGatedComingSoon from "@/components/dashboard/RoleGatedComingSoon";
export default function RequirementsLayout({ children }: { children: ReactNode }) {
  return <RoleGatedComingSoon feature="external-orders">{children}</RoleGatedComingSoon>;
}
