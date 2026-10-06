import type { ReactNode } from "react";

import RoleGatedComingSoon from "@/components/dashboard/RoleGatedComingSoon";

export default function DocumentsLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGatedComingSoon feature="documents">
      {children}
    </RoleGatedComingSoon>
  );
}
