"use client";

import Link from "next/link";
import { FiAlertTriangle, FiLock } from "react-icons/fi";
import { useCompanyAccess, COMPANY_APPROVAL_MESSAGE } from "@/utils/companyAccess";

export default function CompanyApprovalBanner() {
  const { companyApproval, isReadOnly } = useCompanyAccess();
  if (!isReadOnly) return null;

  const rejected = companyApproval?.status === "REJECTED";
  const missing = !companyApproval?.companyId;
  const title = missing
    ? "Company approval required"
    : rejected ? "Your company was not accepted" : "Your company is awaiting acceptance";
  const message = missing
    ? "Link an accepted company before performing business actions. You can continue browsing the platform."
    : COMPANY_APPROVAL_MESSAGE;

  return (
    <section
      role="status"
      data-company-read-only-banner
      className={`mb-4 rounded-2xl border px-4 py-3 shadow-sm ${rejected || missing ? "border-danger-300/60 bg-danger-50 text-danger-900 dark:bg-danger-950/30 dark:text-danger-100" : "border-warning-300/70 bg-warning-50 text-warning-900 dark:bg-warning-950/30 dark:text-warning-100"}`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 rounded-full bg-current/10 p-2" aria-hidden="true">
          {rejected || missing ? <FiAlertTriangle /> : <FiLock />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold">{title}</p>
          <p className="mt-0.5 text-sm opacity-90">{message}</p>
          {companyApproval?.companyName && <p className="mt-1 text-xs font-semibold">Company: {companyApproval.companyName}</p>}
          {rejected && companyApproval?.reviewReason && (
            <p className="mt-2 rounded-lg bg-danger-500/10 px-3 py-2 text-sm"><strong>Review note:</strong> {companyApproval.reviewReason}</p>
          )}
          <Link href="/dashboard/customer-support" className="mt-2 inline-flex text-sm font-bold underline underline-offset-2">
            Contact support
          </Link>
        </div>
      </div>
    </section>
  );
}
