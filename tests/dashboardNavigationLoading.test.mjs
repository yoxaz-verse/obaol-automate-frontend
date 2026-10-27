import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("dashboard navigation starts before routing and safely resets", () => {
  const context = read("../src/context/DashboardNavigationContext.tsx");
  const layout = read("../src/app/dashboard/layout.tsx");
  const quote = read("../src/components/dashboard/DashboardNavigationQuote.tsx");
  assert.match(context, /setPendingPath\(path\)/);
  assert.match(context, /setTimeout\(clearPending, 15000\)/);
  assert.match(context, /pathname !== originPathRef\.current/);
  assert.match(layout, /aria-busy=\{isNavigating \|\| undefined\}/);
  assert.match(layout, /<DashboardNavigationQuote \/>/);
  assert.match(quote, /Opening page…/);
  assert.match(quote, /DASHBOARD_NAVIGATION_QUOTES/);
  assert.match(quote, /useState\(\(\) => selectDashboardNavigationQuote\(\)\)/);
  assert.doesNotMatch(quote, /setInterval|setTimeout/);
  assert.match(layout, /<DashboardNavigationProgress/);
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
