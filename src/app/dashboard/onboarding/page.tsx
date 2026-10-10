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
      <div className="mb-4 flex flex-col gap-1 px-1 sm:mb-5">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Complete your OBAOL setup</h1>
        <p className="text-sm leading-6 text-default-600">Add the details needed to activate your profile. Your progress is saved automatically.</p>
      </div>

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
