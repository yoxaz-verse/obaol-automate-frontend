import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const read = (path) => readFileSync(path, "utf8");

test("agritech startup workspace exposes owner, directory, map and admin review flows", () => {
  const access = read("src/utils/dashboardAccess.ts");
  for (const route of ["/dashboard/agritech-startups", "/dashboard/agritech-startups/my", "/dashboard/agritech-startups/admin"]) assert.match(access, new RegExp(route));
  const form = read("src/app/dashboard/agritech-startups/my/page.tsx");
  for (const field of ["What does the company do?", "Problem solved", "API availability", "Operational states", "Submit for review"]) assert.match(form, new RegExp(field.replace(/[?]/g, "\\?"), "i"));
  const directory = read("src/app/dashboard/agritech-startups/page.tsx");
  assert.match(directory, /Cards/); assert.match(directory, /Map/); assert.match(directory, /API available/); assert.match(directory, /Operational state/);
  const admin = read("src/app/dashboard/agritech-startups/admin/page.tsx");
  assert.match(admin, /Approve and publish/); assert.match(admin, /Request changes/);
});
