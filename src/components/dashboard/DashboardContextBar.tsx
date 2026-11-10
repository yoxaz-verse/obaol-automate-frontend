"use client";

import { useContext } from "react";
import { usePathname } from "next/navigation";
import AuthContext from "@/context/AuthContext";
import { getDashboardHelpId, getDashboardRoute, getDashboardRouteLabel } from "@/utils/dashboardAccess";
import Link from "@/components/dashboard/DashboardLink";

export default function DashboardContextBar() {
  const pathname = usePathname();
  const { user } = useContext(AuthContext);
  const route = getDashboardRoute(pathname);
  if (!route || route.path === "/dashboard") return null;
  const parentPath = route.activeParent || route.breadcrumbParent;
  const parentRoute = parentPath ? getDashboardRoute(parentPath) : null;
  const helpId = getDashboardHelpId(pathname) || route.helpId;

  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border db-border-subtle db-subtle px-3 py-2 text-xs">
      <nav aria-label="Current dashboard location" className="flex min-w-0 flex-wrap items-center gap-2 text-default-700">
        <Link href="/dashboard" className="rounded-sm font-semibold transition-colors hover:text-obaol-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obaol-500 focus-visible:ring-offset-2 dark:hover:text-obaol-300">Dashboard</Link>
        <span className="text-default-600" aria-hidden="true">/</span>
        {parentRoute && parentRoute.path !== "/dashboard" && parentRoute.path !== route.path ? (
          <>
            <Link href={parentRoute.path} className="rounded-sm font-semibold transition-colors hover:text-obaol-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obaol-500 focus-visible:ring-offset-2 dark:hover:text-obaol-300">{getDashboardRouteLabel(parentRoute.path, user?.role)}</Link>
            <span className="text-default-600" aria-hidden="true">/</span>
          </>
        ) : null}
        <span className="truncate font-bold text-foreground" aria-current="page">{getDashboardRouteLabel(route.path, user?.role)}</span>
      </nav>
      <Link href={`/dashboard/guidance#${helpId}`} className="font-semibold db-muted hover:text-foreground">Help for this page</Link>
    </div>
  );
}
