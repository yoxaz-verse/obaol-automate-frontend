import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

test("admin company workspace uses the compact capability manager", () => {
  const page = read("../src/app/dashboard/companies/page.tsx");
  assert.equal(page.includes("CompanyCapabilityManager"), true);
  assert.equal(page.includes('className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start"'), true);
  assert.equal(page.includes("Sector Affiliations"), false);
  assert.equal(page.includes("CompanyInterestsModal"), false);
  for (const tab of ['key="catalog"', 'key="orders"', 'key="enquiries"', 'key="activity"']) {
    assert.equal(page.includes(tab), true, `missing operational tab ${tab}`);
  }
});

test("capability manager supports full profiles, priorities, pending review, and immediate saves", () => {
  const manager = read("../src/components/dashboard/Company/CompanyCapabilityManager.tsx");
  for (const field of [
    "providedFunctionIds",
    "soughtFunctionIds",
    "providedFunctionPriorities",
    "soughtFunctionPriorities",
  ]) assert.equal(manager.includes(field), true, `missing ${field}`);
  assert.equal(manager.includes('status: "PENDING_REVIEW"'), true);
  assert.equal(manager.includes('review.mutate("APPROVE")'), true);
  assert.equal(manager.includes('review.mutate("REJECT")'), true);
  assert.equal(manager.includes("Resolve Pending First"), true);
  assert.equal(manager.includes('putData("/auth/company-interests"'), true);
  assert.equal(manager.includes("Changes apply immediately"), true);
  assert.equal(manager.includes("current.length < 6"), true);
  assert.equal(manager.includes("reconcileCompanyFunctionPriorities"), true);
});
