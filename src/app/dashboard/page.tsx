"use client";
import Dashboard from "@/components/dashboard/dashboard";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showApprovedMessage, setShowApprovedMessage] = useState(false);

  useEffect(() => {
    const approval = String(searchParams?.get("approval") || "").toLowerCase();
    if (approval !== "approved") return;
    setShowApprovedMessage(true);
    router.replace("/dashboard");
  }, [router, searchParams]);

  return (
    <>
      {showApprovedMessage && (
        <div className="mb-4 rounded-2xl border border-success-500/30 bg-success-500/10 px-4 py-3">
          <p className="text-sm font-semibold text-success-700 dark:text-success-300">
            You have been approved. Your dashboard access is now active.
          </p>
        </div>
      )}
      <Dashboard />
    </>
  );
}

export default Page;
