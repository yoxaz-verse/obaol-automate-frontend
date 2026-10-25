import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

test("desktop navigation groups are accordion-controlled while the collapsed rail stays flat", () => {
  const sidebar = read("../src/components/dashboard/Sidebar.tsx");

  assert.equal(sidebar.includes("setOpenNavigationGroup(isOpen ? null : row.label)"), true);
  assert.equal(sidebar.includes("aria-expanded={isOpen}"), true);
  assert.equal(sidebar.includes("if (activeNavigationGroupLabel) setOpenNavigationGroup(activeNavigationGroupLabel)"), true);
  assert.equal(sidebar.includes('aria-current={isActive ? "page" : undefined}'), true);
  assert.equal(sidebar.includes('kind: "group"'), true);
  assert.equal(sidebar.includes('row.kind === "group" && !isCollapsed'), true);
  assert.equal(sidebar.includes("rowOptions.map((opt) => renderOption(opt))"), true);
  assert.equal(sidebar.includes("Business Workflows"), false);
  assert.equal(sidebar.includes("Operations/Admin"), false);
});

test("mobile navigation groups share accordion and active-route behavior", () => {
  const topBar = read("../src/components/dashboard/TopBar.tsx");

  assert.equal(topBar.includes("setOpenMobileNavigationGroup(isOpen ? null : group.label)"), true);
  assert.equal(topBar.includes("if (activeMobileNavigationGroupLabel) setOpenMobileNavigationGroup(activeMobileNavigationGroupLabel)"), true);
  assert.equal(topBar.includes("{sec.groups ? sec.groups.map((group) =>"), true);
  assert.equal(topBar.includes("setIsMobileMenuOpen(false)"), true);
  assert.equal(topBar.includes('role="dialog"'), true);
  assert.equal(topBar.includes('event.key === "Escape"'), true);
});

test("mobile primary navigation keeps labels visible and exposes the complete menu", () => {
  const bottomNav = read("../src/components/dashboard/BottomNav.tsx");
  assert.equal(bottomNav.includes('aria-label="Primary workspace navigation"'), true);
  assert.equal(bottomNav.includes('aria-label="More workspace navigation"'), true);
  assert.equal(bottomNav.includes("opacity-0 translate-y-1 h-0"), false);
  assert.equal(bottomNav.includes("isDashboardRouteActive"), true);
});

test("dashboard context breadcrumbs contain only real navigation destinations", () => {
  const contextBar = read("../src/components/dashboard/DashboardContextBar.tsx");

  assert.equal(contextBar.includes('>Dashboard</Link>'), true);
  assert.equal(contextBar.includes("getDashboardRouteLabel(parentRoute.path, user?.role)"), true);
  assert.equal(contextBar.includes('parentRoute.path !== "/dashboard"'), true);
  assert.equal(contextBar.includes("route.taskGroup"), false);
  assert.equal(contextBar.includes("route.section"), false);
  assert.equal(contextBar.includes(">Overview</Link>"), false);
  assert.equal(contextBar.includes("roleLabel"), false);
  assert.equal(contextBar.includes("Company associate"), false);
  assert.equal(contextBar.includes("Help for this page"), true);
});

test("desktop top bar keeps clocks and exposes identity only in the profile control", () => {
  const topBar = read("../src/components/dashboard/TopBar.tsx");

  assert.equal(topBar.includes("{/* Desktop Identity */}"), false);
  assert.equal(topBar.includes("{displayRole} · Online"), false);
  assert.equal(topBar.includes("Local time"), true);
  assert.equal(topBar.includes(">UTC</span>"), true);
  assert.equal(topBar.includes("username?.split('@')[0]"), true);
  assert.equal(topBar.includes("{/* Profile Command Center */}"), true);
});

test("settings pages rely on the shared context breadcrumb", () => {
  for (const path of [
    "../src/app/dashboard/settings/page.tsx",
    "../src/app/dashboard/profile/page.tsx",
    "../src/app/dashboard/security/page.tsx",
    "../src/app/dashboard/shortcuts/page.tsx",
  ]) {
    const page = read(path);
    assert.equal(page.includes("breadcrumbs={"), false, `${path} still declares a duplicate breadcrumb`);
  }
});

test("customer support exposes normalized call and WhatsApp actions", () => {
  const page = read("../src/app/dashboard/customer-support/page.tsx");
  const links = read("../src/core/api/supportContacts.ts");
  assert.equal(page.includes("Call Now"), true);
  assert.equal(page.includes("Chat on WhatsApp"), true);
  assert.equal(page.includes("Customer support is currently unavailable."), true);
  assert.equal(links.includes("tel:${e164}"), true);
  assert.equal(links.includes("https://wa.me/"), true);
});

test("warehouse navigation is live for all associates and available cards expose phone contact", () => {
  const privateRoute = read("../src/components/Login/private-route.tsx");
  const warehousePage = read("../src/app/dashboard/warehouses/page.tsx");
  const comingSoonGate = read("../src/components/dashboard/RoleGatedComingSoon.tsx");
  const sidebar = read("../src/components/dashboard/Sidebar.tsx");

  assert.equal(privateRoute.includes("hasWarehouseWorkspaceAccess"), false);
  assert.equal(privateRoute.includes("Warehouse workspace"), false);
  assert.equal(comingSoonGate.includes('feature === "warehouse-booking"'), true);
  assert.equal(comingSoonGate.includes('["associate", "customer"].includes(normalizedRole)'), true);
  assert.equal(sidebar.includes("capabilities"), true);
  assert.equal(warehousePage.includes("normalizeDialPhone"), true);
  assert.equal(warehousePage.includes("Contact unavailable"), true);
  assert.equal(warehousePage.includes("tel:${normalizeDialPhone(phone)}"), true);
});

test("documents workspace is live for every authenticated dashboard user", () => {
  const documentsLayout = read("../src/app/dashboard/documents/layout.tsx");
  const documentsPage = read("../src/app/dashboard/documentation/page.tsx");
  const externalOrdersLayout = read("../src/app/dashboard/external-orders/layout.tsx");
  const warehouseBookingLayout = read("../src/app/dashboard/warehouse-rent/layout.tsx");

  assert.equal(documentsLayout.includes("RoleGatedComingSoon"), false);
  assert.equal(documentsLayout.includes("return <>{children}</>"), true);
  assert.equal(documentsPage.includes("Documentation workspace"), true);
  assert.equal(documentsPage.includes('role === "associate"'), true);
  assert.equal(documentsPage.includes('role === "admin"'), true);
  assert.equal(externalOrdersLayout.includes('<RoleGatedComingSoon feature="external-orders">'), true);
  assert.equal(warehouseBookingLayout.includes('<RoleGatedComingSoon feature="warehouse-booking">'), true);
});

test("notifications use the compact inbox and role-aware composer", () => {
  const page = read("../src/app/dashboard/notifications/page.tsx");
  assert.equal(page.includes("Telemetry Inbox"), false);
  assert.equal(page.includes("Cluster Density"), false);
  assert.equal(page.includes("Send a notification"), true);
  assert.equal(page.includes("notification-support-participants"), true);
  assert.equal(page.includes('role="alert"'), true);
  assert.equal(page.includes("notificationCategoryRoutes"), true);
});

test("dashboard streams enriched enquiry notifications into notification caches", () => {
  const layout = read("../src/app/dashboard/layout.tsx");
  const subscriber = read("../src/components/dashboard/LiveNotificationSubscriber.tsx");
  const panel = read("../src/components/dashboard/NotificationPanel.tsx");
  assert.equal(layout.includes("<LiveNotificationSubscriber userId={user?.id} />"), true);
  assert.equal(subscriber.includes("new EventSource(streamUrl(), { withCredentials: true })"), true);
  assert.equal(subscriber.includes('["notifications", "unread-count"]'), true);
  assert.equal(subscriber.includes('["notifications", "unread-summary"]'), true);
  assert.equal(panel.includes("item.payload.productName"), true);
  assert.equal(panel.includes("item.payload.buyerCompanyName"), true);
});

test("resolved support conversations expose accessible ratings and private staff reporting", () => {
  const workspace = read("../src/components/dashboard/SupportWorkspace.tsx");
  const routes = read("../src/core/api/apiRoutes.tsx");
  assert.equal(workspace.includes('role="radiogroup"'), true);
  assert.equal(workspace.includes('role="radio"'), true);
  assert.equal(workspace.includes("Rate your support experience"), true);
  assert.equal(workspace.includes("Your feedback is anonymized."), true);
  assert.equal(workspace.includes("Support ratings"), true);
  assert.equal(routes.includes('ratingsMine: "/support/ratings/me"'), true);
  assert.equal(routes.includes("/rating`"), true);
});
