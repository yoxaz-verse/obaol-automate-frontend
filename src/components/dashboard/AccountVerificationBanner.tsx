"use client";

import Link from "next/link";
import { useContext } from "react";
import { FiShield } from "react-icons/fi";
import AuthContext from "@/context/AuthContext";

export default function AccountVerificationBanner() {
  const { user } = useContext(AuthContext);
  const role = String(user?.role || "").toLowerCase();
  if (!user || !["associate", "operator", "team"].includes(role) || user.fullyVerified) return null;
  const deadline = user.verificationGraceEndsAt ? new Date(user.verificationGraceEndsAt) : null;
  const deadlineLabel = deadline && !Number.isNaN(deadline.getTime()) ? deadline.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null;
  return <div className="mb-4 flex flex-col gap-3 rounded-xl border border-warning-400/40 bg-warning-50 p-4 text-warning-900 dark:bg-warning-500/10 dark:text-warning-100 sm:flex-row sm:items-center sm:justify-between" role="status">
    <div className="flex items-start gap-3"><FiShield className="mt-0.5 shrink-0" /><div><p className="font-bold">Complete email and WhatsApp verification</p><p className="mt-1 text-xs">Your personal profile is not yet 100% verified.{deadlineLabel ? ` Complete verification by ${deadlineLabel}.` : ""}</p></div></div>
    <Link href="/dashboard/profile" className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg bg-warning-500 px-4 text-xs font-black text-brand-abyssal">Verify account</Link>
  </div>;
}
