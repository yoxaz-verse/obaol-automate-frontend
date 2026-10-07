"use client";

import Link from "next/link";
import { FiArrowRight, FiShoppingBag, FiTag, FiTruck, FiShield, FiCheckCircle, FiGlobe } from "react-icons/fi";
import { usePublicAuthStatus } from "@/hooks/usePublicAuthStatus";

export default function HeroCTA() {
  const { isAuthenticated, loading } = usePublicAuthStatus();
  const href = !loading && isAuthenticated ? "/dashboard" : "/auth";

  return (
    <div className="flex w-full max-w-2xl flex-col items-start gap-6 pt-2">
      {/* Primary Action Button */}
      <Link
        href={href}
        className="group relative inline-flex min-h-14 items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-obaol-500 via-amber-500 to-obaol-600 px-6 py-3.5 text-base font-extrabold text-obaol-950 shadow-[0_10px_30px_-10px_rgba(207,152,60,0.6)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_16px_40px_-10px_rgba(207,152,60,0.8)] active:scale-[0.98] sm:px-7"
      >
        <span className="relative z-10">
          {!loading && isAuthenticated ? "Open Workspace" : "Get Started Now"}
        </span>
        <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-obaol-950/15 text-obaol-950 transition-transform duration-300 group-hover:translate-x-1">
          <FiArrowRight size={18} />
        </span>
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/25 to-white/0 transition-transform duration-1000 ease-in-out group-hover:translate-x-full" />
      </Link>

      {/* Role Navigation Chips */}
      {!loading && !isAuthenticated && (
        <div className="w-full space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/50">I want to:</span>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <Link
              href="/auth/register?intent=BUY"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-default-200 bg-background/80 px-3 py-2 text-center text-xs font-bold leading-tight text-foreground/80 backdrop-blur-sm transition-all duration-200 hover:border-obaol-500/50 hover:bg-obaol-500/10 hover:text-obaol-700 hover:shadow-sm dark:hover:text-obaol-300"
            >
              <FiShoppingBag className="text-obaol-500" size={14} />
              <span>Start Buying</span>
            </Link>
            <Link
              href="/auth/register?intent=SELL"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-default-200 bg-background/80 px-3 py-2 text-center text-xs font-bold leading-tight text-foreground/80 backdrop-blur-sm transition-all duration-200 hover:border-obaol-500/50 hover:bg-obaol-500/10 hover:text-obaol-700 hover:shadow-sm dark:hover:text-obaol-300"
            >
              <FiTag className="text-obaol-500" size={14} />
              <span>Start Selling</span>
            </Link>
            <Link
              href="/auth/operator/register"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-default-200 bg-background/80 px-3 py-2 text-center text-xs font-bold leading-tight text-foreground/80 backdrop-blur-sm transition-all duration-200 hover:border-obaol-500/50 hover:bg-obaol-500/10 hover:text-obaol-700 hover:shadow-sm dark:hover:text-obaol-300"
            >
              <FiTruck className="text-obaol-500" size={14} />
              <span>Work in Operations</span>
            </Link>
          </div>
        </div>
      )}

      {/* Trust Highlights Strip */}
      <div className="grid w-full grid-cols-1 gap-3 border-t border-default-200/60 pt-5 text-xs font-semibold leading-tight text-foreground/60 sm:grid-cols-3 sm:gap-4">
        <span className="flex items-start gap-2">
          <FiShield className="mt-0.5 shrink-0 text-obaol-500" size={15} />
          <span>Verified Counterparties</span>
        </span>
        <span className="flex items-start gap-2">
          <FiCheckCircle className="mt-0.5 shrink-0 text-obaol-500" size={15} />
          <span>10-Step Ground Audit</span>
        </span>
        <span className="flex items-start gap-2">
          <FiGlobe className="mt-0.5 shrink-0 text-obaol-500" size={15} />
          <span>India & Export Markets</span>
        </span>
      </div>
    </div>
  );
}
