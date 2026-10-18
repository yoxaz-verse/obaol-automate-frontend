import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { getGovernedRouteStatus, resolveSidebarGovernance } from "../src/utils/sidebarGovernance.ts";

const governancePagePath = new URL("../src/app/dashboard/sidebar-governance/page.tsx", import.meta.url);

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

test("participant-specific destinations resolve independently", () => {
  const resolved = resolveSidebarGovernance([
    row("testing", "/dashboard/quality-labs", "SEEKING", "LIVE", 1),
    row("testing", "/dashboard/quality-labs/my", "PROVIDING", "LIVE", 2),
    row("testing", "/dashboard/quality-labs/execution", "PROVIDING", "COMING_SOON", 3),
    row("importing-to-india", "/dashboard/imports/my-listings", "PROVIDING", "LIVE", 4),
    row("importing-to-india", "/dashboard/imports/reservations", "SEEKING", "LIVE", 5),
    row("warehouse-storage", "/dashboard/warehouses/operations", "PROVIDING", "HIDDEN", 6),
  ], ["testing", "importing-to-india", "warehouse-storage"], []);
  assert.equal(getGovernedRouteStatus(resolved, "/dashboard/quality-labs/my"), "LIVE");
  assert.equal(getGovernedRouteStatus(resolved, "/dashboard/quality-labs/execution"), "COMING_SOON");
  assert.equal(getGovernedRouteStatus(resolved, "/dashboard/imports/reservations"), "LIVE");
  assert.equal(getGovernedRouteStatus(resolved, "/dashboard/warehouses/operations"), "HIDDEN");
});

test("common routes are excluded and work placement suppresses other services", () => {
  const resolved = resolveSidebarGovernance([
    row("buyer", "/dashboard", "BOTH", "LIVE", 0),
    row("buyer", "/dashboard/catalog", "OTHER_SERVICES", "LIVE", 1),
    row("seller", "/dashboard/catalog", "SEEKING", "COMING_SOON", 5),
    row("buyer", "/dashboard/quality-labs", "OTHER_SERVICES", "LIVE", 2),
  ], ["buyer", "seller"], []);
  assert.equal(resolved.some((item) => item.routePath === "/dashboard"), false);
  assert.equal(resolved.some((item) => item.routePath === "/dashboard/catalog" && item.placement === "OTHER_SERVICES"), false);
  assert.equal(resolved.some((item) => item.routePath === "/dashboard/catalog" && item.placement === "SEEKING"), true);
  assert.equal(resolved.some((item) => item.routePath === "/dashboard/quality-labs" && item.placement === "OTHER_SERVICES"), true);
});

test("v2 resolves seeking and providing against their own company perspectives", () => {
  const resolved = resolveSidebarGovernance([
    row("buyer", "/dashboard/bidding", "SEEKING", "LIVE", 0),
    row("seller", "/dashboard/product", "PROVIDING", "LIVE", 0),
    row("packaging", "/dashboard/orders", "BOTH", "LIVE", 0),
  ], ["seller", "packaging"], ["buyer", "packaging"], { resolutionVersion: 2 });
  assert.equal(resolved.some((item) => item.routePath === "/dashboard/bidding" && item.placement === "SEEKING"), true);
  assert.equal(resolved.some((item) => item.routePath === "/dashboard/product" && item.placement === "PROVIDING"), true);
  assert.deepEqual(resolved.filter((item) => item.routePath === "/dashboard/orders").map((item) => item.placement).sort(), ["PROVIDING", "SEEKING"]);
});

test("v2 does not activate a work rule from the wrong perspective and uses global section order", () => {
  const resolved = resolveSidebarGovernance([
    row("buyer", "/dashboard/bidding", "SEEKING", "LIVE", 0),
    row("buyer", "/dashboard/catalog", "PROVIDING", "LIVE", 0),
    row("buyer", "/dashboard/orders", "OTHER_SERVICES", "LIVE", 0),
    row("seller", "/dashboard/product", "PROVIDING", "LIVE", 99),
  ], ["buyer", "seller"], [], {
    resolutionVersion: 2,
    sectionOrder: { PROVIDING: ["/dashboard/product", "/dashboard/catalog"], SEEKING: [], OTHER_SERVICES: ["/dashboard/orders"] },
  });
  assert.equal(resolved.some((item) => item.routePath === "/dashboard/bidding"), false);
  assert.deepEqual(resolved.filter((item) => item.placement === "PROVIDING").map((item) => item.routePath), ["/dashboard/product", "/dashboard/catalog"]);
  assert.equal(resolved.some((item) => item.routePath === "/dashboard/orders" && item.placement === "OTHER_SERVICES"), true);
});

test("admin editor exposes one independent matrix row per company function", async () => {
  const source = await readFile(governancePagePath, "utf8");
  assert.match(source, /selected\.assignments\.map/);
  assert.match(source, />Company function</);
  assert.match(source, />Perspective</);
  assert.match(source, /"Unassigned"/);
  assert.match(source, /patch\.placement === "UNASSIGNED" \? \{ status: "HIDDEN"/);
  assert.match(source, /Other Services \(legacy\)/);
  assert.doesNotMatch(source, /Add audience rule/);
  assert.doesNotMatch(source, /Unselected functions in Other Services/);
});

test("seller-only Bidding requires Seller in provided capabilities", () => {
  const mappings = [
    row("seller", "/dashboard/bidding", "PROVIDING", "LIVE"),
    row("buyer", "/dashboard/bidding", "OTHER_SERVICES", "HIDDEN"),
  ];
  assert.equal(getGovernedRouteStatus(resolveSidebarGovernance(mappings, [], ["seller"], { resolutionVersion: 2 }), "/dashboard/bidding"), "HIDDEN");
  assert.equal(resolveSidebarGovernance(mappings, ["seller"], [], { resolutionVersion: 2 }).some((item) => item.routePath === "/dashboard/bidding" && item.placement === "PROVIDING"), true);
  assert.equal(getGovernedRouteStatus(resolveSidebarGovernance(mappings, ["buyer"], [], { resolutionVersion: 2 }), "/dashboard/bidding"), "HIDDEN");
});
