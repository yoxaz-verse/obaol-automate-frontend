import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { getGovernedRouteStatus, resolveSidebarGovernance } from "../src/utils/sidebarGovernance.ts";
import {
  applyAssignmentPanelStatus,
  assignmentAppearsInPanel,
  assignmentPanelPlacements,
  getAssignmentPanelState,
  toggleFunctionPanel,
} from "../src/utils/sidebarGovernanceEditor.ts";

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

test("admin editor exposes four assignment panels including Unassigned", async () => {
  const source = await readFile(governancePagePath, "utf8");
  assert.deepEqual(assignmentPanelPlacements, ["SEEKING", "PROVIDING", "OTHER_SERVICES", "UNASSIGNED"]);
  assert.match(source, /assignmentPanelPlacements\.map/);
  assert.match(source, /Seeking For/);
  assert.match(source, /Other Services/);
  assert.match(source, /Not shown anywhere in associate navigation/);
  assert.match(source, /aria-pressed=\{active\}/);
  assert.match(source, /Mixed statuses/);
  assert.match(source, /\["SEEKING", "PROVIDING", "OTHER_SERVICES"\]/);
  assert.doesNotMatch(source, /Other Services \(legacy\)/);
  assert.doesNotMatch(source, /<table/);
});

test("seeking and providing chips combine internally and can be removed independently", () => {
  const assignments = [
    { functionSlug: "buyer", placement: "SEEKING", status: "COMING_SOON" },
    { functionSlug: "seller", placement: "PROVIDING", status: "LIVE" },
  ];
  const both = toggleFunctionPanel(assignments, "buyer", "PROVIDING");
  assert.deepEqual(both.find((item) => item.functionSlug === "buyer"), {
    functionSlug: "buyer", placement: "BOTH", status: "COMING_SOON",
  });
  assert.equal(assignmentAppearsInPanel(both[0], "SEEKING"), true);
  assert.equal(assignmentAppearsInPanel(both[0], "PROVIDING"), true);
  assert.equal(assignmentAppearsInPanel(both[0], "OTHER_SERVICES"), false);
  const seekingOnly = toggleFunctionPanel(both, "buyer", "PROVIDING");
  assert.deepEqual(seekingOnly.find((item) => item.functionSlug === "buyer"), {
    functionSlug: "buyer", placement: "SEEKING", status: "COMING_SOON",
  });
  const removed = toggleFunctionPanel(seekingOnly, "buyer", "SEEKING");
  assert.deepEqual(removed.find((item) => item.functionSlug === "buyer"), {
    functionSlug: "buyer", placement: "UNASSIGNED", status: "HIDDEN",
  });
});

test("panel statuses preserve mixed values until an explicit normalization", () => {
  const assignments = [
    { functionSlug: "buyer", placement: "BOTH", status: "LIVE" },
    { functionSlug: "seller", placement: "BOTH", status: "COMING_SOON" },
    { functionSlug: "packaging", placement: "UNASSIGNED", status: "HIDDEN" },
  ];
  assert.deepEqual(getAssignmentPanelState(assignments, "SEEKING"), { count: 2, status: "MIXED" });
  assert.deepEqual(getAssignmentPanelState(assignments, "PROVIDING"), { count: 2, status: "MIXED" });
  const moved = toggleFunctionPanel(assignments, "packaging", "SEEKING");
  assert.equal(moved.find((item) => item.functionSlug === "packaging")?.status, "LIVE");
  const normalized = applyAssignmentPanelStatus(moved, "SEEKING", "COMING_SOON");
  assert.deepEqual(normalized.filter((item) => ["SEEKING", "BOTH"].includes(item.placement)).map((item) => item.status), ["COMING_SOON", "COMING_SOON", "COMING_SOON"]);
  assert.deepEqual(getAssignmentPanelState(normalized, "PROVIDING"), { count: 2, status: "COMING_SOON" });

  const assignedWithHiddenStatus = [...assignments, { functionSlug: "testing", placement: "PROVIDING", status: "HIDDEN" }];
  const movedFromAnotherPanel = toggleFunctionPanel(assignedWithHiddenStatus, "testing", "SEEKING");
  assert.equal(movedFromAnotherPanel.find((item) => item.functionSlug === "testing")?.placement, "BOTH");
  assert.equal(movedFromAnotherPanel.find((item) => item.functionSlug === "testing")?.status, "HIDDEN");
});

test("Other Services stays exclusive from work perspectives", () => {
  const assignments = [{ functionSlug: "warehouse-storage", placement: "BOTH", status: "LIVE" }];
  const other = toggleFunctionPanel(assignments, "warehouse-storage", "OTHER_SERVICES");
  assert.deepEqual(other, [{ functionSlug: "warehouse-storage", placement: "OTHER_SERVICES", status: "LIVE" }]);
  const providing = toggleFunctionPanel(other, "warehouse-storage", "PROVIDING");
  assert.deepEqual(providing, [{ functionSlug: "warehouse-storage", placement: "PROVIDING", status: "LIVE" }]);
});

test("Unassigned is a stable explicit state and Other Services can remain Hidden", () => {
  const assignments = [{ functionSlug: "testing", placement: "OTHER_SERVICES", status: "LIVE" }];
  assert.deepEqual(applyAssignmentPanelStatus(assignments, "OTHER_SERVICES", "HIDDEN"), [
    { functionSlug: "testing", placement: "OTHER_SERVICES", status: "HIDDEN" },
  ]);
  const unassigned = toggleFunctionPanel(assignments, "testing", "UNASSIGNED");
  assert.deepEqual(unassigned, [{ functionSlug: "testing", placement: "UNASSIGNED", status: "HIDDEN" }]);
  assert.deepEqual(toggleFunctionPanel(unassigned, "testing", "UNASSIGNED"), unassigned);
  assert.equal(assignmentAppearsInPanel(unassigned[0], "UNASSIGNED"), true);
});

test("Unassigned mappings never resolve into associate navigation", () => {
  const mappings = [row("buyer", "/dashboard/bidding", "UNASSIGNED", "HIDDEN")];
  assert.deepEqual(resolveSidebarGovernance(mappings, ["buyer"], ["buyer"], { resolutionVersion: 2 }), []);
  assert.equal(getGovernedRouteStatus([], "/dashboard/bidding"), "HIDDEN");
});

test("seller-only Bidding requires Seller in provided capabilities", () => {
  const mappings = [
    row("seller", "/dashboard/bidding", "PROVIDING", "LIVE"),
    row("buyer", "/dashboard/bidding", "UNASSIGNED", "HIDDEN"),
  ];
  assert.equal(getGovernedRouteStatus(resolveSidebarGovernance(mappings, [], ["seller"], { resolutionVersion: 2 }), "/dashboard/bidding"), "HIDDEN");
  assert.equal(resolveSidebarGovernance(mappings, ["seller"], [], { resolutionVersion: 2 }).some((item) => item.routePath === "/dashboard/bidding" && item.placement === "PROVIDING"), true);
  assert.equal(getGovernedRouteStatus(resolveSidebarGovernance(mappings, ["buyer"], [], { resolutionVersion: 2 }), "/dashboard/bidding"), "HIDDEN");
});
