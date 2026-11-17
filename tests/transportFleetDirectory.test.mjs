import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { canAccessDashboardRoute, getDashboardRoute } from "../src/utils/dashboardAccess.ts";

test("truck directory routes are registered for operational users", () => {
  for (const path of ["/dashboard/inland-transportation/directory", "/dashboard/inland-transportation/directory/507f1f77bcf86cd799439011"]) {
    assert.ok(getDashboardRoute(path));
    for (const role of ["Admin", "Associate", "Operator", "Team"]) assert.equal(canAccessDashboardRoute({ path, role }), true);
  }
});

test("truck directory communicates privacy and fleet publication controls", () => {
  const directory = readFileSync("src/app/dashboard/inland-transportation/directory/page.tsx", "utf8");
  const detail = readFileSync("src/app/dashboard/inland-transportation/directory/[id]/page.tsx", "utf8");
  const fleet = readFileSync("src/app/dashboard/inland-transportation/fleet/page.tsx", "utf8");
  assert.match(directory, /privacy-safe approximate locations/i);
  assert.match(detail, /full registration are restricted/i);
  assert.match(fleet, /Publish on truck map/);
  assert.match(fleet, /Update exact truck position/);
});

test("transportation uses lifecycle navigation and list-first fleet editing", () => {
  const workspace = readFileSync("src/components/inland-transportation/InlandWorkspace.tsx", "utf8");
  const overview = readFileSync("src/app/dashboard/inland-transportation/page.tsx", "utf8");
  const fleet = readFileSync("src/app/dashboard/inland-transportation/fleet/page.tsx", "utf8");
  assert.match(workspace, /Discover/);
  assert.match(workspace, /Operate/);
  assert.match(workspace, /Manage/);
  assert.match(workspace, /aria-current/);
  assert.match(overview, /Transportation lifecycle/);
  assert.match(overview, /Needs attention/);
  assert.match(fleet, /Search \$\{tab\}/);
  assert.match(fleet, /EditorDrawer/);
});
