import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  canAccessDashboardRoute,
  DASHBOARD_ADMIN_GROUP_ORDER,
  getAccessibleDashboardRoutes,
  getDashboardAdminGroups,
  getDashboardRoute,
  hasWarehouseWorkspaceAccess,
  isDashboardRouteActive,
  isWarehouseDashboardPath,
  normalizeDashboardRole,
  getDashboardRouteLabel,
} from "../src/utils/dashboardAccess.ts";
import { DASHBOARD_ADMIN_WORKFLOW_GROUPS } from "../src/utils/adminSidebarGroups.ts";

const collectPages = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const fullPath = join(directory, entry.name);
  if (entry.isDirectory()) return collectPages(fullPath);
  return entry.name === "page.tsx" ? [fullPath] : [];
});

test("unknown dashboard routes are denied", () => {
  assert.equal(getDashboardRoute("/dashboard/not-a-real-route"), null);
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/not-a-real-route", role: "Admin" }), false);
});

test("import reservation labels reflect the viewer scope", () => {
  assert.equal(getDashboardRouteLabel("/dashboard/imports/reservations", "Associate"), "My Import Reservations");
  for (const role of ["Admin", "Operator", "Team"]) {
    assert.equal(getDashboardRouteLabel("/dashboard/imports/reservations", role), "Import Reservations");
  }
  assert.equal(getDashboardRouteLabel("/dashboard/imports", "Associate"), "Import Opportunities");
  assert.equal(
    getAccessibleDashboardRoutes({ role: "Associate" }).find((route) => route.path === "/dashboard/imports/reservations")?.label,
    "My Import Reservations",
  );
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

test("settings owns account subpages while notifications stays independently active", () => {
  const links = new Set(
    getAccessibleDashboardRoutes({ role: "Associate" }).map((route) => route.path)
  );
  assert.equal(links.has("/dashboard/settings"), true);
  assert.equal(links.has("/dashboard/company"), false);
  assert.equal(links.has("/dashboard/notifications"), false);
  assert.equal(links.has("/dashboard/profile"), false);
  assert.equal(links.has("/dashboard/security"), false);
  assert.equal(links.has("/dashboard/shortcuts"), false);
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/company", role: "Associate" }), true);
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/notifications", role: "Associate" }), true);
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/profile", role: "Associate" }), true);
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/security", role: "Associate" }), true);
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/shortcuts", role: "Associate" }), true);
  assert.equal(isDashboardRouteActive("/dashboard/company", "/dashboard/settings"), true);
  assert.equal(isDashboardRouteActive("/dashboard/notifications", "/dashboard/settings"), false);
  assert.equal(isDashboardRouteActive("/dashboard/notifications", "/dashboard/notifications"), true);
  assert.equal(isDashboardRouteActive("/dashboard/profile", "/dashboard/settings"), true);
  assert.equal(isDashboardRouteActive("/dashboard/security", "/dashboard/settings"), true);
  assert.equal(isDashboardRouteActive("/dashboard/shortcuts", "/dashboard/settings"), true);
});

test("non-Associate roles retain standalone notification navigation", () => {
  for (const role of ["Admin", "Operator", "Team"]) {
    const links = new Set(getAccessibleDashboardRoutes({ role }).map((route) => route.path));
    assert.equal(links.has("/dashboard/notifications"), true, `${role} should retain Notifications navigation`);
  }
});

test("Associate capabilities personalize without gating navigation", () => {
  for (const capabilities of [["buyer"], ["seller"], ["importing-to-india"], []]) {
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
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/security", role: "CustomerSupport" }), true);
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/orders", role: "CustomerSupport" }), false);
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/users", role: "CustomerSupport" }), false);
});

test("Associate sidebar routes use the requested buying, account, and support groups", () => {
  assert.equal(getDashboardRoute("/dashboard/marketplace")?.taskGroup, "Buy");
  assert.equal(getDashboardRoute("/dashboard/catalog")?.taskGroup, "Company & Account");
  assert.equal(getDashboardRoute("/dashboard/settings")?.taskGroup, "Company & Account");
  assert.equal(getDashboardRoute("/dashboard/guidance")?.taskGroup, "Support");
  assert.equal(getDashboardRoute("/dashboard/customer-support")?.taskGroup, "Support");
});

test("Associate desktop and mobile navigation share common and governed sidebar groups", () => {
  const navigation = readFileSync("src/utils/dashboardNav.ts", "utf8");
  const desktop = readFileSync("src/components/dashboard/Sidebar.tsx", "utf8");
  const mobile = readFileSync("src/components/dashboard/TopBar.tsx", "utf8");
  const labels = ["Home", "Seeking", "Providing", "Other Services", "Common"];
  let previousIndex = -1;
  for (const label of labels) {
    const index = navigation.indexOf(`label: \"${label}\"`, previousIndex + 1);
    assert.ok(index > previousIndex, `${label} should appear in the expected Associate sidebar order`);
    previousIndex = index;
  }
  assert.match(navigation, /getCapabilityActionLinks\(selectedCapabilities, perspective\)/);
  assert.match(navigation, /!selectedCapabilityLinks\.has\(path\)/);
  assert.match(navigation, /SIDEBAR_HOME_ROUTES\.filter/);
  assert.match(navigation, /SIDEBAR_UTILITY_ROUTES\.filter/);
  assert.match(navigation, /links\("OTHER_SERVICES"\)/);
  assert.match(readFileSync("src/utils/utils.tsx", "utf8"), /link: "\/dashboard\/commercial-documents"/);
  for (const source of [desktop, mobile]) {
    assert.match(source, /user\?\.providedCapabilities \|\| \[\]/);
    assert.match(source, /user\?\.soughtCapabilities \|\| \[\]/);
  }
});

test("Admin sidebar groups operational routes by workflow without duplicates", () => {
  assert.deepEqual(DASHBOARD_ADMIN_WORKFLOW_GROUPS.map((group) => group.label), [
    "Buying",
    "Selling",
    "Trade",
    "Labs",
    "Packaging",
    "Warehouse",
  ]);
  assert.deepEqual(DASHBOARD_ADMIN_WORKFLOW_GROUPS.find((group) => group.label === "Buying")?.links, [
    "/dashboard/marketplace",
    "/dashboard/bidding/my",
    "/dashboard/imports",
    "/dashboard/catalog",
  ]);
  assert.deepEqual(DASHBOARD_ADMIN_WORKFLOW_GROUPS.find((group) => group.label === "Selling")?.links, [
    "/dashboard/product",
    "/dashboard/bidding",
    "/dashboard/imports/my-listings",
    "/dashboard/inventory",
  ]);
  assert.deepEqual(DASHBOARD_ADMIN_WORKFLOW_GROUPS.find((group) => group.label === "Labs")?.links, [
    "/dashboard/quality-labs",
    "/dashboard/quality-labs/my",
    "/dashboard/quality-labs/execution",
  ]);
  const groupedLinks = DASHBOARD_ADMIN_WORKFLOW_GROUPS.flatMap((group) => group.links);
  const expectedOperationalLinks = getAccessibleDashboardRoutes({ role: "Admin" })
    .filter((route) => ["Trade", "Products", "Services", "Warehouse"].includes(route.section) || route.path === "/dashboard/inventory")
    .map((route) => route.path);
  assert.equal(new Set(groupedLinks).size, groupedLinks.length);
  assert.deepEqual(new Set(groupedLinks), new Set(expectedOperationalLinks));
});

test("Admin sidebar places Organization below Operations/Admin", () => {
  const navigation = readFileSync("src/utils/dashboardNav.ts", "utf8");
  const adminBranch = navigation.slice(navigation.indexOf('if (normalizedRole === "admin")'));
  const operationsIndex = adminBranch.indexOf('label: "Operations/Admin"');
  const organizationIndex = adminBranch.indexOf('label: "Organization"');

  assert.ok(operationsIndex >= 0);
  assert.ok(organizationIndex > operationsIndex);
});

test("Associate coming-soon navigation is ordered, disabled, and does not change direct route access", () => {
  const navigation = readFileSync("src/utils/dashboardNav.ts", "utf8");
  const documents = navigation.indexOf('"/dashboard/documents"');
  const pureDocuments = navigation.indexOf('"/dashboard/commercial-documents"');
  const externalOrders = navigation.indexOf('"/dashboard/external-orders"');
  assert.ok(documents >= 0 && documents < pureDocuments && pureDocuments < externalOrders);
  assert.match(navigation, /normalizeDashboardRole\(role\) !== "admin" && COMING_SOON_NAV_PATHS\.has\(path\)/);
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/commercial-documents", role: "Associate" }), true);
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/documents", role: "Associate" }), true);
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/external-orders", role: "Associate" }), true);
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

test("Warehouse routes are live for associates regardless of capabilities", () => {
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
  assert.equal(getDashboardRoute("/dashboard/warehouses")?.section, "Warehouse");
  assert.equal(getDashboardRoute("/dashboard/warehouse-rent")?.taskGroup, "Warehouse");

  assert.equal(hasWarehouseWorkspaceAccess("Associate", ["warehouse-storage"]), true);
  assert.equal(hasWarehouseWorkspaceAccess("Associate", ["testing"]), true);
  assert.equal(hasWarehouseWorkspaceAccess("Associate", []), true);
  assert.equal(hasWarehouseWorkspaceAccess("Admin", []), true);
  assert.equal(hasWarehouseWorkspaceAccess("Operator", []), true);
  assert.equal(hasWarehouseWorkspaceAccess("Team", []), true);
  assert.equal(isWarehouseDashboardPath("/dashboard/warehouses"), true);
  assert.equal(isWarehouseDashboardPath("/dashboard/warehouse-rent"), true);
  assert.equal(isWarehouseDashboardPath("/dashboard/warehouses/location"), true);
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/warehouse-rent", role: "Associate" }), true);
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/warehouses", role: "Associate" }), true);
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/warehouses/location", role: "Associate" }), true);
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
