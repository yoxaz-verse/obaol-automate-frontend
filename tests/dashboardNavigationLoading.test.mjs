import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("dashboard navigation starts before routing and safely resets", () => {
  const context = read("../src/context/DashboardNavigationContext.tsx");
  const layout = read("../src/app/dashboard/DashboardClientLayout.tsx");
  assert.match(context, /setPendingPath\(path\)/);
  assert.match(context, /setTimeout\(clearPending, 15000\)/);
  assert.match(context, /pathname === originPathRef\.current/);
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
  assert.match(sidebar, /marketplaceFirstPageQueryOptions/);
});

test("dashboard route fallback uses a stable content skeleton", () => {
  const loading = read("../src/app/dashboard/loading.tsx");
  assert.match(loading, /SectionSkeleton/);
  assert.doesNotMatch(loading, /BrandedLoader/);
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
