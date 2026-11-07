"use client";

import Link from "next/link";
import { useContext } from "react";
import { FiShield, FiArrowRight } from "react-icons/fi";
import AuthContext from "@/context/AuthContext";

export default function AccountVerificationBanner() {
  const { user } = useContext(AuthContext);
  const role = String(user?.role || "").toLowerCase();
  if (!user || !["associate", "operator", "team"].includes(role) || user.fullyVerified) return null;
  const deadline = user.verificationGraceEndsAt ? new Date(user.verificationGraceEndsAt) : null;
  const deadlineLabel = deadline && !Number.isNaN(deadline.getTime()) ? deadline.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null;

  return (
    <div
      role="status"
      className="mb-4 flex flex-col gap-4 rounded-2xl border db-border-subtle db-panel border-l-4 border-l-obaol-500 p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-obaol-500/25 bg-obaol-500/10 text-obaol-600 dark:text-obaol-400">
          <FiShield size={19} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold tracking-tight text-foreground">
            Complete email and WhatsApp verification
          </p>
          <p className="mt-0.5 text-xs text-default-500 dark:text-default-400">
            Your personal profile is not yet 100% verified.
            {deadlineLabel ? ` Complete verification by ${deadlineLabel}.` : ""}
          </p>
        </div>
      </div>
      <Link
        href="/dashboard/profile"
        className="group inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-obaol-400 via-amber-400 to-obaol-500 px-4 py-2 text-xs font-black text-brand-abyssal shadow-sm transition-all duration-200 hover:opacity-95 active:scale-[0.98]"
      >
        <span>Verify account</span>
        <FiArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
