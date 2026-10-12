"use client";

import React, { useContext } from "react";
import AuthContext from "@/context/AuthContext";
import AssociateOnboardingForm from "@/components/onboarding/AssociateOnboardingForm";
import OperatorOnboardingForm from "@/components/onboarding/OperatorOnboardingForm";

export default function DashboardOnboardingPage() {
  const { user, loading } = useContext(AuthContext);
  const roleLower = String(user?.role || "").toLowerCase();
  const isOperator = roleLower === "operator" || roleLower === "team";
  const isAssociate = roleLower === "associate";
  if (loading) return null;

  return (
    <div className="w-full max-w-[1280px] mx-auto">
      {isAssociate ? (
        <AssociateOnboardingForm mode="onboarding" />
      ) : isOperator ? (
        <OperatorOnboardingForm mode="onboarding" />
      ) : (
        <div className="rounded-2xl border border-default-200/60 bg-background/70 px-6 py-5 text-sm text-default-600">
          Your role does not require onboarding.
        </div>
      )}
    </div>
  );
}
