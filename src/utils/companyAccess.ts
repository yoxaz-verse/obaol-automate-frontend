"use client";

import { useContext } from "react";
import AuthContext, { CompanyApproval } from "@/context/AuthContext";

export const COMPANY_APPROVAL_REQUIRED = "COMPANY_APPROVAL_REQUIRED";
export const COMPANY_APPROVAL_MESSAGE = "Your company is not accepted yet. You can browse the platform, but business actions are disabled until approval.";

export function isCompanyReadOnly(role: unknown, registrationStatus: unknown, companyApproval?: CompanyApproval | null) {
  return String(role || "").toLowerCase() === "associate"
    && String(registrationStatus || "").toUpperCase() === "APPROVED"
    && companyApproval?.actionsAllowed !== true;
}

export function useCompanyAccess() {
  const { user } = useContext(AuthContext);
  const companyApproval = user?.companyApproval || null;
  return {
    companyApproval,
    actionsAllowed: !isCompanyReadOnly(user?.role, user?.registrationStatus, companyApproval),
    isReadOnly: isCompanyReadOnly(user?.role, user?.registrationStatus, companyApproval),
  };
}

export function isCompanyApprovalError(error: any) {
  return error?.response?.data?.code === COMPANY_APPROVAL_REQUIRED;
}
