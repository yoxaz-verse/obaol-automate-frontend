import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  canAccessDashboardRoute,
  DASHBOARD_ADMIN_GROUP_ORDER,
  getAccessibleDashboardRoutes,
  getDashboardAdminGroups,
  getDashboardRoute,
  isDashboardRouteActive,
  normalizeDashboardRole,
} from "../src/utils/dashboardAccess.ts";

const collectPages = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const fullPath = join(directory, entry.name);
  if (entry.isDirectory()) return collectPages(fullPath);
  return entry.name === "page.tsx" ? [fullPath] : [];
});

test("unknown dashboard routes are denied", () => {
  assert.equal(getDashboardRoute("/dashboard/not-a-real-route"), null);
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/not-a-real-route", role: "Admin" }), false);
});

test("legacy Customer is normalized to an Associate without capability gating", () => {
  assert.equal(normalizeDashboardRole("Customer"), "associate");
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/marketplace", role: "Customer" }), true);
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/product", role: "Customer" }), true);
});

test("detail routes keep their parent navigation item active", () => {
  assert.equal(isDashboardRouteActive("/dashboard/enquiries/507f1f77bcf86cd799439011", "/dashboard/enquiries"), true);
  assert.equal(isDashboardRouteActive("/dashboard/orders/507f1f77bcf86cd799439011", "/dashboard/orders"), true);
  assert.equal(isDashboardRouteActive("/dashboard/orders/507f1f77bcf86cd799439011", "/dashboard"), false);
});

test("settings owns company, notification, profile, and shortcut navigation", () => {
  const links = new Set(
    getAccessibleDashboardRoutes({ role: "Associate" }).map((route) => route.path)
  );
  assert.equal(links.has("/dashboard/settings"), true);
  assert.equal(links.has("/dashboard/company"), false);
  assert.equal(links.has("/dashboard/notifications"), false);
  assert.equal(links.has("/dashboard/profile"), false);
  assert.equal(links.has("/dashboard/shortcuts"), false);
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/company", role: "Associate" }), true);
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/notifications", role: "Associate" }), true);
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/profile", role: "Associate" }), true);
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/shortcuts", role: "Associate" }), true);
  assert.equal(isDashboardRouteActive("/dashboard/company", "/dashboard/settings"), true);
  assert.equal(isDashboardRouteActive("/dashboard/notifications", "/dashboard/settings"), true);
  assert.equal(isDashboardRouteActive("/dashboard/profile", "/dashboard/settings"), true);
  assert.equal(isDashboardRouteActive("/dashboard/shortcuts", "/dashboard/settings"), true);
});

test("non-Associate roles retain standalone notification navigation", () => {
  for (const role of ["Admin", "Operator", "Team"]) {
    const links = new Set(getAccessibleDashboardRoutes({ role }).map((route) => route.path));
    assert.equal(links.has("/dashboard/notifications"), true, `${role} should retain Notifications navigation`);
  }
});

test("Associate capabilities personalize without gating navigation", () => {
  for (const capabilities of [["buying"], ["selling"], ["importing-to-india"], []]) {
    const links = new Set(getAccessibleDashboardRoutes({ role: "Associate", capabilities }).map((route) => route.path));
    assert.equal(links.has("/dashboard/marketplace"), true);
    assert.equal(links.has("/dashboard/product"), true);
    assert.equal(links.has("/dashboard/settings"), true);
    assert.equal(links.has("/dashboard/customer-support"), true);
  }
});

test("Customer Support is available to every dashboard role", () => {
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/customer-support", role: "Associate" }), true);
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/customer-support", role: "Admin" }), true);
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/customer-support", role: "Operator" }), true);
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/customer-support", role: "Team" }), true);
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/customer-support", role: "CustomerSupport" }), true);
});

test("Customer Support agents receive only their support workspace and account routes", () => {
  const links = new Set(getAccessibleDashboardRoutes({ role: "CustomerSupport" }).map((route) => route.path));
  assert.deepEqual([...links], [
    "/dashboard",
    "/dashboard/notifications",
    "/dashboard/settings",
    "/dashboard/customer-support",
  ]);
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/profile", role: "CustomerSupport" }), true);
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/orders", role: "CustomerSupport" }), false);
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/users", role: "CustomerSupport" }), false);
});

test("Associate sidebar routes use the requested account and support groups", () => {
  assert.equal(getDashboardRoute("/dashboard/catalog")?.taskGroup, "Company & Account");
  assert.equal(getDashboardRoute("/dashboard/settings")?.taskGroup, "Company & Account");
  assert.equal(getDashboardRoute("/dashboard/guidance")?.taskGroup, "Support");
  assert.equal(getDashboardRoute("/dashboard/customer-support")?.taskGroup, "Support");
});

test("SERVICE Associates receive both contact-based service directories", () => {
  const links = new Set(getAccessibleDashboardRoutes({
    role: "Associate",
        capabilities: ["warehouse-storage"],
  }).map((route) => route.path));
  assert.equal(links.has("/dashboard/warehouse-rent"), true);
  assert.equal(links.has("/dashboard/quality-labs"), true);
});

test("Team receives Operator routes without Admin routes", () => {
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/operator/team", role: "team" }), true);
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/product", role: "team" }), true);
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/approvals", role: "team" }), false);
});

test("Warehouse Booking stays visible regardless of priority interests", () => {
  const interestedLinks = new Set(getAccessibleDashboardRoutes({
    role: "Associate",
        capabilities: ["warehouse-storage"],
  }).map((route) => route.path));
  const uninterestedLinks = new Set(getAccessibleDashboardRoutes({
    role: "Associate",
        capabilities: ["testing"],
  }).map((route) => route.path));
  const operatorWithoutInterest = new Set(getAccessibleDashboardRoutes({
    role: "Operator",
        capabilities: [],
  }).map((route) => route.path));
  const adminWithoutInterest = new Set(getAccessibleDashboardRoutes({
    role: "Admin",
        capabilities: [],
  }).map((route) => route.path));

  assert.equal(interestedLinks.has("/dashboard/warehouse-rent"), true);
  assert.equal(uninterestedLinks.has("/dashboard/warehouse-rent"), true);
  assert.equal(operatorWithoutInterest.has("/dashboard/warehouse-rent"), true);
  assert.equal(adminWithoutInterest.has("/dashboard/warehouse-rent"), true);
  assert.equal(uninterestedLinks.has("/dashboard/quality-labs"), true);
});

test("every dashboard page has an explicit access policy", () => {
  const dashboardDirectory = fileURLToPath(new URL("../src/app/dashboard", import.meta.url));
  const unmapped = collectPages(dashboardDirectory)
    .map((file) => {
      const directory = relative(dashboardDirectory, file.slice(0, -"/page.tsx".length));
      const suffix = directory
        ? `/${directory.split(sep).map((part) => part.replace(/^\[(.+)\]$/, ":$1")).join("/")}`
        : "";
      return `/dashboard${suffix}`;
    })
    .filter((route) => !getDashboardRoute(route.replace(/:\w+/g, "test-id")));
  assert.deepEqual(unmapped, []);
});

test("every dashboard route exposes complete experience metadata", () => {
  const routes = getAccessibleDashboardRoutes({ role: "Admin" });
  for (const route of routes) {
    assert.ok(route.description, `${route.path} needs a description`);
    assert.ok(route.journeyStage, `${route.path} needs a journey stage`);
    assert.ok(route.helpId, `${route.path} needs a help id`);
    assert.ok(route.requiredApprovalStates.length > 0, `${route.path} needs approval policy`);
    assert.ok(route.navIcon, `${route.path} needs a navigation icon key`);
    assert.ok(route.taskGroup, `${route.path} needs a task group`);
  }
});

test("Operations/Admin navigation is grouped in the intended order", () => {
  const routes = getAccessibleDashboardRoutes({ role: "Admin" });
  const groups = getDashboardAdminGroups(routes);

  assert.deepEqual(groups.map((group) => group.label), DASHBOARD_ADMIN_GROUP_ORDER);
  assert.deepEqual(groups.find((group) => group.label === "Team & Users")?.links, [
    "/dashboard/operator/hierarchy",
    "/dashboard/operator/team",
    "/dashboard/operator/earnings",
    "/dashboard/operators/overview",
    "/dashboard/users",
  ]);
  assert.deepEqual(groups.find((group) => group.label === "Rules & Automation")?.links, [
    "/dashboard/payments",
    "/dashboard/flow-rules",
    "/dashboard/order-rules",
    "/dashboard/enquiry-rules",
    "/dashboard/calculations",
  ]);
});

test("Operations/Admin groups omit inaccessible and empty groups", () => {
  for (const role of ["Operator", "Team"]) {
    const routes = getAccessibleDashboardRoutes({ role });
    const groups = getDashboardAdminGroups(routes);
    assert.deepEqual(groups.map((group) => group.label), ["Team & Users", "Platform Setup"]);
    assert.deepEqual(groups[0].links, [
      "/dashboard/operator/hierarchy",
      "/dashboard/operator/team",
      "/dashboard/operator/earnings",
    ]);
    assert.deepEqual(groups[1].links, ["/dashboard/customer-support"]);
  }
});
