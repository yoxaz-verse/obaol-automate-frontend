import type { ReactNode } from "react";

import RoleGatedComingSoon from "@/components/dashboard/RoleGatedComingSoon";

export default function WarehouseBookingLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGatedComingSoon feature="warehouse-booking">
      {children}
    </RoleGatedComingSoon>
  );
}
