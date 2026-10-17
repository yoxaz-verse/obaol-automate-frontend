"use client";

import { useEffect } from "react";
import CatalogApprovalQueues from "@/components/dashboard/Approvals/CatalogApprovalQueues";
import { patchData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";

export default function CatalogRequestsPage() {
  useEffect(() => { patchData(apiRoutes.notifications.markSectionRead("approvals"), {}).catch(() => undefined); }, []);
  return <main className="w-full p-6 md:p-10"><CatalogApprovalQueues /></main>;
}
