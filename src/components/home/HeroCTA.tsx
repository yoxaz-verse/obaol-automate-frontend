"use client";

import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { usePublicAuthStatus } from "@/hooks/usePublicAuthStatus";

export default function HeroCTA() {
  const { isAuthenticated, loading } = usePublicAuthStatus();
  const href = !loading && isAuthenticated ? "/dashboard" : "/auth";

  return (
    <div className="flex flex-col items-start gap-7">
      <Link href={href} className="public-button public-button--primary group">
        {!loading && isAuthenticated ? "Open workspace" : "Get started"}
        <FiArrowRight aria-hidden="true" size={20} className="transition-transform group-hover:translate-x-1" />
      </Link>
      {!loading && !isAuthenticated && (
        <div className="flex flex-wrap items-center gap-6 md:gap-10">
          <Link href="/auth/register?intent=BUY" className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/50 hover:text-obaol-700 sm:text-xs">Start buying</Link>
          <Link href="/auth/register?intent=SELL" className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/50 hover:text-obaol-700 sm:text-xs">Start selling</Link>
          <Link href="/auth/operator/register" className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/50 hover:text-obaol-700 sm:text-xs">Work in operations</Link>
        </div>
      )}
    </div>
  );
}
