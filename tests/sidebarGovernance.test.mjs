import test from "node:test";
import assert from "node:assert/strict";
import { getGovernedRouteStatus, resolveSidebarGovernance } from "../src/utils/sidebarGovernance.ts";

const row = (functionSlug, routePath, placement, status, order = 0) => ({ functionSlug, routePath, placement, status, order });

test("sidebar governance expands both placements and preserves order", () => {
  const resolved = resolveSidebarGovernance([
    row("buyer", "/dashboard/marketplace", "BOTH", "LIVE", 2),
    row("buyer", "/dashboard/enquiries", "SEEKING", "COMING_SOON", 1),
  ], ["buyer"], []);
  assert.deepEqual(resolved.map(({ routePath, placement, status }) => ({ routePath, placement, status })), [
    { routePath: "/dashboard/enquiries", placement: "SEEKING", status: "COMING_SOON" },
    { routePath: "/dashboard/marketplace", placement: "SEEKING", status: "LIVE" },
    { routePath: "/dashboard/marketplace", placement: "PROVIDING", status: "LIVE" },
  ]);
});

test("multi-function conflicts use the most available status and lowest equal-status order", () => {
  const resolved = resolveSidebarGovernance([
    row("buyer", "/dashboard/orders", "SEEKING", "HIDDEN", 9),
    row("seller", "/dashboard/orders", "SEEKING", "COMING_SOON", 5),
    row("sourcing", "/dashboard/orders", "SEEKING", "LIVE", 7),
    row("testing", "/dashboard/quality-labs", "PROVIDING", "LIVE", 8),
    row("warehouse-storage", "/dashboard/quality-labs", "PROVIDING", "LIVE", 3),
  ], ["buyer", "seller", "sourcing", "testing", "warehouse-storage"], []);
  assert.equal(getGovernedRouteStatus(resolved, "/dashboard/orders"), "LIVE");
  assert.equal(resolved.find((item) => item.routePath === "/dashboard/quality-labs")?.order, 3);
});

test("unmapped routes fail closed while recovery routes remain live", () => {
  assert.equal(getGovernedRouteStatus([], "/dashboard/product"), "HIDDEN");
  assert.equal(getGovernedRouteStatus([], "/dashboard"), "LIVE");
  assert.equal(getGovernedRouteStatus([], "/dashboard/settings"), "LIVE");
  assert.equal(getGovernedRouteStatus([], "/dashboard/customer-support"), "LIVE");
  assert.equal(getGovernedRouteStatus([], "/dashboard/onboarding"), "LIVE");
});
