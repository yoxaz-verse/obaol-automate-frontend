"use client";

import Link from "next/link";
import { useContext } from "react";
import { usePathname } from "next/navigation";
import AuthContext from "@/context/AuthContext";
import { getDashboardRoute } from "@/utils/dashboardAccess";
import { deriveExperienceContext } from "@/utils/experienceContext";
import { tradeModeLabel } from "@/utils/terminology";

export default function DashboardContextBar() {
  const pathname = usePathname();
  const { user } = useContext(AuthContext);
  const route = getDashboardRoute(pathname);
  const experience = deriveExperienceContext(user);
  if (!route || route.path === "/dashboard") return null;

  const roleLabel = experience.role === "associate"
    ? tradeModeLabel(experience.tradeMode)
    : experience.role === "team" ? "Operations team" : experience.role === "operator" ? "Operator" : "Admin";

  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border db-border-subtle db-subtle px-3 py-2 text-xs">
      <nav aria-label="Current dashboard location" className="flex min-w-0 items-center gap-2 db-muted">
        <Link href="/dashboard" className="font-semibold hover:text-foreground">Overview</Link>
        <span aria-hidden="true">/</span>
        <span>{route.section}</span>
        <span aria-hidden="true">/</span>
        <span className="truncate font-semibold text-foreground" aria-current="page">{route.label}</span>
      </nav>
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-obaol-500/10 px-2.5 py-1 font-semibold text-obaol-700 dark:text-obaol-300">{roleLabel}</span>
        <Link href={`/dashboard/guidance#${route.helpId}`} className="font-semibold db-muted hover:text-foreground">Help for this page</Link>
      </div>
    </div>
  );
}
