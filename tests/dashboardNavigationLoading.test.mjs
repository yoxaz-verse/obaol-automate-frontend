import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("dashboard navigation starts before routing and safely resets", () => {
  const context = read("../src/context/DashboardNavigationContext.tsx");
  const layout = read("../src/app/dashboard/DashboardClientLayout.tsx");
  assert.match(context, /setPendingPath\(destination\)/);
  assert.match(context, /setTimeout\(clearPending, 15000\)/);
  assert.match(context, /pathname === originPathRef\.current/);
  assert.match(context, /destination === current/);
  assert.match(context, /popstate/);
  assert.match(context, /obaol:navigation-error/);
  assert.match(layout, /aria-busy=\{isNavigating \|\| undefined\}/);
  assert.doesNotMatch(layout, /DashboardNavigationQuote|Opening page|backdrop-blur/);
  assert.match(layout, /<DashboardNavigationProgress/);
  assert.match(context, /performance\.measure/);
  assert.match(context, /prefetchedPathsRef/);
});

test("dashboard entry points share navigation feedback and intent prefetch", () => {
  for (const path of [
    "../src/components/dashboard/Sidebar.tsx",
    "../src/components/dashboard/TopBar.tsx",
    "../src/components/dashboard/GlobalSearch.tsx",
    "../src/components/dashboard/BottomNav.tsx",
    "../src/components/dashboard/DashboardContextBar.tsx",
  ]) {
    const source = read(path);
    assert.match(source, /useDashboardNavigation|DashboardLink/, path);
  }
  const sidebar = read("../src/components/dashboard/Sidebar.tsx");
  assert.match(sidebar, /isComingSoonDashboardNavigation/);
  assert.match(sidebar, /warmDestination/);
  assert.match(sidebar, /aria-busy=\{isPending \|\| undefined\}/);
  assert.doesNotMatch(sidebar, /warmNext|setTimeout\(warmNext/);
  assert.match(sidebar, /warmDashboardRoute/);
});

test("dashboard route fallback uses a stable content skeleton", () => {
  const loading = read("../src/app/dashboard/loading.tsx");
  assert.match(loading, /DashboardRouteSkeleton/);
  assert.doesNotMatch(loading, /BrandedLoader/);
});

test("priority dashboard routes expose stable route-level skeletons", () => {
  for (const route of ["marketplace", "inventory", "enquiries", "orders", "profile", "approvals", "users", "companies", "operators/overview"]) {
    const loading = read(`../src/app/dashboard/${route}/loading.tsx`);
    assert.match(loading, /DashboardRouteSkeleton/);
  }
  const skeleton = read("../src/components/dashboard/DashboardRouteSkeleton.tsx");
  assert.match(skeleton, /role="status"/);
  assert.match(skeleton, /motion-reduce:animate-none/);
});

test("dashboard diagnostics capture bounded, privacy-safe performance samples", () => {
  const observer = read("../src/components/dashboard/DashboardPerformanceObserver.tsx");
  const layout = read("../src/app/dashboard/DashboardClientLayout.tsx");
  assert.match(layout, /<DashboardPerformanceObserver/);
  assert.match(observer, /MAX_SAMPLES = 100/);
  assert.match(observer, /obaol:navigation-timing/);
  assert.match(observer, /obaol:api-timing/);
  assert.match(observer, /longtask/);
  assert.doesNotMatch(observer, /detail\.(?:token|body|response|user|email)/i);
});

test("navigation timing covers route commit and painted content readiness", () => {
  const context = read("../src/context/DashboardNavigationContext.tsx");
  const ready = read("../src/components/dashboard/DashboardContentReady.tsx");
  assert.match(context, /routeCommittedAt/);
  assert.match(context, /contentReadyAt/);
  assert.match(context, /obaol:navigation-timing/);
  assert.match(context, /markContentReady/);
  assert.match(ready, /requestAnimationFrame/);
});

test("priority warmups are centralized, bounded, and data-saver aware", () => {
  const warmups = read("../src/core/navigation/dashboardRouteWarmup.ts");
  for (const route of ["dashboard", "marketplace", "inventory", "enquiries", "orders", "profile"]) {
    assert.match(warmups, new RegExp(`/${route === "dashboard" ? "dashboard" : `dashboard/${route}`}`));
  }
  assert.match(warmups, /saveData/);
  assert.match(warmups, /prefers-reduced-data/);
  assert.match(warmups, /warmedDataRoutes/);
  for (const route of ["users", "companies", "operators\\/overview", "approvals"]) {
    assert.match(warmups, new RegExp(`/dashboard/${route}`));
  }
});

test("read requests emit privacy-safe timing without query or response payloads", () => {
  const api = read("../src/core/api/apiHandler.tsx");
  assert.match(api, /obaol:api-timing/);
  assert.match(api, /String\(url\)\.split\("\?"\)\[0\]/);
  assert.match(api, /x-request-id/);
  assert.doesNotMatch(api, /detail:\s*\{[^}]*params/s);
});

test("order fallback is bounded and only runs for legacy not-found lookups", () => {
  const order = read("../src/app/dashboard/orders/[id]/page.tsx");
  assert.match(order, /response\?\.status \|\| 0\) !== 404/);
  assert.match(order, /page: 1, limit: 25/);
  assert.doesNotMatch(order, /page: 1, limit: 100, sort: "createdAt:desc"/);
});

test("approval summary and tab badges reuse the same count queries", () => {
  const approvals = read("../src/app/dashboard/approvals/page.tsx");
  assert.match(approvals, /approvalCountOptions/);
  assert.match(approvals, /\["approval-summary", kind\]/);
  assert.doesNotMatch(approvals, /\["approvals", "associates", "PENDING_REVIEW", "count"\]/);
});

test("periodic query refresh does not duplicate the initial request", () => {
  const query = read("../src/components/queryComponent.tsx");
  assert.match(query, /refetchInterval: refreshEnabled \? refreshInterval : false/);
  assert.match(query, /refetchIntervalInBackground: false/);
  assert.doesNotMatch(query, /if \(enabled && refreshEnabled\) void refetch\(\)/);
});

test("marketplace prefetch and page queries share reusable cache definitions", () => {
  const queries = read("../src/core/data/useMarketplace.ts");
  const marketplace = read("../src/app/dashboard/marketplace/page.tsx");
  assert.match(queries, /marketplaceFirstPageQueryOptions/);
  assert.match(queries, /marketplaceStatsQueryOptions/);
  assert.match(queries, /marketplaceVisibilityQueryOptions/);
  assert.match(queries, /staleTime: 30_000/);
  assert.match(marketplace, /marketplaceStatsQueryOptions\(\)/);
  assert.match(marketplace, /marketplaceVisibilityQueryOptions\(\)/);
});

test("imports use reusable prefetch options, skeletons, and retry states", () => {
  const hooks = read("../src/core/data/useImports.ts");
  const imports = read("../src/app/dashboard/imports/page.tsx");
  assert.match(hooks, /export const importsQueryOptions/);
  assert.match(hooks, /export const importReservationsQueryOptions/);
  assert.match(imports, /<DashboardGridSkeleton/);
  assert.match(imports, /Try again/);
  assert.match(imports, /refetchImports/);
  assert.doesNotMatch(imports, /Loading listings\.\.\./);
});

test("production container exposes readiness and bounded warmup", () => {
  const health = read("../src/app/api/health/route.ts");
  const dockerfile = read("../Dockerfile");
  const startup = read("../scripts/start-with-warmup.sh");
  assert.match(health, /status: "ok"/);
  assert.match(dockerfile, /HEALTHCHECK/);
  assert.match(dockerfile, /start-with-warmup\.sh/);
  assert.match(startup, /warm-dashboard\.mjs/);
  assert.match(startup, /attempt.*-ge 30/);
});
