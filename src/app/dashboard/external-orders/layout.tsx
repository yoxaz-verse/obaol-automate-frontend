import type { ReactNode } from "react";

import RoleGatedComingSoon from "@/components/dashboard/RoleGatedComingSoon";

export default function ExternalOrdersLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGatedComingSoon feature="external-orders">
      {children}
    </RoleGatedComingSoon>
  );
}
