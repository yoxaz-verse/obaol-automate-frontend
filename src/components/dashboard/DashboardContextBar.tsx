"use client";

import Link from "next/link";
import { useContext } from "react";
import { usePathname } from "next/navigation";
import AuthContext from "@/context/AuthContext";
import { getDashboardRoute, getDashboardRouteLabel } from "@/utils/dashboardAccess";

export default function DashboardContextBar() {
  const pathname = usePathname();
  const { user } = useContext(AuthContext);
  const route = getDashboardRoute(pathname);
  if (!route || route.path === "/dashboard") return null;
  const parentRoute = route.activeParent ? getDashboardRoute(route.activeParent) : null;

  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border db-border-subtle db-subtle px-3 py-2 text-xs">
      <nav aria-label="Current dashboard location" className="flex min-w-0 items-center gap-2 db-muted">
        <Link href="/dashboard" prefetch={false} className="font-semibold hover:text-foreground">Dashboard</Link>
        <span aria-hidden="true">/</span>
        {parentRoute && parentRoute.path !== "/dashboard" && parentRoute.path !== route.path ? (
          <>
            <Link href={parentRoute.path} prefetch={false} className="font-semibold hover:text-foreground">{getDashboardRouteLabel(parentRoute.path, user?.role)}</Link>
            <span aria-hidden="true">/</span>
          </>
        ) : null}
        <span className="truncate font-semibold text-foreground" aria-current="page">{getDashboardRouteLabel(route.path, user?.role)}</span>
      </nav>
      <Link href={`/dashboard/guidance#${route.helpId}`} prefetch={false} className="font-semibold db-muted hover:text-foreground">Help for this page</Link>
    </div>
  );
}
