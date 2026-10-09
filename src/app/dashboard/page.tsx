"use client";
import Dashboard from "@/components/dashboard/dashboard";
import React, { useContext, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthContext from "@/context/AuthContext";

function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showApprovedMessage, setShowApprovedMessage] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const role = String(user?.role || "").toLowerCase().replace(/[\s_-]+/g, "");
    if (role === "customersupport") router.replace("/dashboard/customer-support");
  }, [router, user?.role]);

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
