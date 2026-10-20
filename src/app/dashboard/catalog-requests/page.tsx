"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import CatalogApprovalQueues from "@/components/dashboard/Approvals/CatalogApprovalQueues";

export default function CatalogRequestsPage() {
  void CatalogApprovalQueues;
  const router = useRouter();
  useEffect(() => { router.replace("/dashboard/approvals?workflow=catalog"); }, [router]);
  return <main className="grid min-h-48 place-items-center text-sm text-default-500">Opening Catalog &amp; Service Profile approvals…</main>;
}
