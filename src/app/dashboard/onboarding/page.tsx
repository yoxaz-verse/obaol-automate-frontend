"use client";

import React, { useContext, useEffect, useState } from "react";
import AuthContext from "@/context/AuthContext";
import AssociateOnboardingForm from "@/components/onboarding/AssociateOnboardingForm";
import OperatorOnboardingForm from "@/components/onboarding/OperatorOnboardingForm";

export default function DashboardOnboardingPage() {
  const { user, loading } = useContext(AuthContext);
  const roleLower = String(user?.role || "").toLowerCase();
  const isOperator = roleLower === "operator" || roleLower === "team";
  const isAssociate = roleLower === "associate";
  const [completedSummarySteps, setCompletedSummarySteps] = useState(0);

  useEffect(() => {
    if (!isAssociate && !isOperator) return;
    if (typeof window === "undefined") return;
    const draftKey = isAssociate ? "onboarding_draft_associate" : "onboarding_draft_operator";
    const maxStepForSubmit = isAssociate ? 4 : 3;
    const readDraft = () => {
      try {
        const raw = window.localStorage.getItem(draftKey);
        if (!raw) {
          setCompletedSummarySteps(0);
          return;
        }
        const parsed = JSON.parse(raw);
        const completedStep = Number(parsed?.completedStep || 0);
        let summary = 0;
        if (completedStep >= 1) summary = 1;
        if (completedStep >= 2) summary = 2;
        if (completedStep >= maxStepForSubmit) summary = 3;
        setCompletedSummarySteps(summary);
      } catch {
        setCompletedSummarySteps(0);
      }
    };
    readDraft();
    const handler = (event: any) => {
      const detailRole = String(event?.detail?.role || "").toLowerCase();
      if ((isAssociate && detailRole === "associate") || (isOperator && detailRole === "operator")) {
        readDraft();
      }
    };
    window.addEventListener("onboardingDraftUpdated", handler);
    return () => window.removeEventListener("onboardingDraftUpdated", handler);
  }, [isAssociate, isOperator]);

  if (loading) return null;

  return (
    <div className="w-full max-w-[1100px] mx-auto">
      <div className="mb-6 rounded-3xl border border-warning-500/20 bg-warning-500/5 px-6 py-5">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-warning-600">Guided Setup</p>
        <h1 className="text-2xl font-black text-foreground mt-2">Welcome inside OBAOL</h1>
        <p className="text-sm text-default-600 mt-2 max-w-2xl">
          Follow the steps below to activate your profile. Navigation stays locked until onboarding is complete.
        </p>
        {completedSummarySteps > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] font-semibold text-default-600">
            {completedSummarySteps >= 1 && (
              <div className="rounded-2xl border border-default-200/60 bg-background/70 px-4 py-3">
                1. Fill your identity and contact details
              </div>
            )}
            {completedSummarySteps >= 2 && (
              <div className="rounded-2xl border border-default-200/60 bg-background/70 px-4 py-3">
                2. Provide company or operational information
              </div>
            )}
            {completedSummarySteps >= 3 && (
              <div className="rounded-2xl border border-default-200/60 bg-background/70 px-4 py-3">
                3. Submit to unlock the dashboard
              </div>
            )}
          </div>
        )}
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
