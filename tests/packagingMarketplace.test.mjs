import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { canAccessDashboardRoute, getDashboardRoute } from "../src/utils/dashboardAccess.ts";

test("Packaging registers the seeker, provider, and execution workspaces", () => {
  for (const path of ["/dashboard/packaging", "/dashboard/packaging/my", "/dashboard/packaging/execution"]) {
    assert.ok(getDashboardRoute(path));
    assert.equal(canAccessDashboardRoute({ path, role: "Associate" }), true);
  }
});

test("Packaging screens retain sealed bidding and milestone UX", () => {
  const services = readFileSync("src/app/dashboard/packaging/page.tsx", "utf8");
  const profile = readFileSync("src/app/dashboard/packaging/my/page.tsx", "utf8");
  const execution = readFileSync("src/app/dashboard/packaging/execution/page.tsx", "utf8");
  assert.match(services, /Provider identities and prices unlock after closing/);
  assert.match(services, /Submit sealed offer/);
  assert.match(profile, /Submit for review/);
  assert.match(profile, /Approval queue/);
  assert.match(execution, /MATERIALS_CONFIRMED/);
  assert.match(execution, /READY_FOR_DISPATCH/);
});
