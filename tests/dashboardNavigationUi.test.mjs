import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

test("desktop Operations/Admin groups are accordion-controlled while the collapsed rail stays flat", () => {
  const sidebar = read("../src/components/dashboard/Sidebar.tsx");

  assert.equal(sidebar.includes("setOpenAdminGroup(isOpen ? null : group.label)"), true);
  assert.equal(sidebar.includes("aria-expanded={isOpen}"), true);
  assert.equal(sidebar.includes("if (activeAdminGroupLabel) setOpenAdminGroup(activeAdminGroupLabel)"), true);
  assert.equal(sidebar.includes('aria-current={isActive ? "page" : undefined}'), true);
  assert.equal(sidebar.includes("!isCollapsed && section.groups ?"), true);
  assert.equal(sidebar.includes(": sectionOptions.map((opt) => renderOption(opt))"), true);
});

test("mobile Operations/Admin groups share accordion and active-route behavior", () => {
  const topBar = read("../src/components/dashboard/TopBar.tsx");

  assert.equal(topBar.includes("setOpenMobileAdminGroup(isOpen ? null : group.label)"), true);
  assert.equal(topBar.includes("if (activeMobileAdminGroupLabel) setOpenMobileAdminGroup(activeMobileAdminGroupLabel)"), true);
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
