import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

test("My Company reuses onboarding categories and priority requests", () => {
  const company = read("../src/app/dashboard/company/page.tsx");
  assert.equal(company.includes("const INTEREST_OPTIONS"), false);
  assert.equal(company.includes("requestedProvidedFunctionIds"), true);
  assert.equal(company.includes("requestedSoughtFunctionIds"), true);
  assert.equal(company.includes("requestedProvidedFunctionPriorities"), true);
  assert.equal(company.includes("requestedSoughtFunctionPriorities"), true);
  assert.equal(company.includes("Priority order (1–3)"), true);
  assert.equal(company.includes("Select 1–6 categories"), true);
});

test("My Company exposes operational overview sections", () => {
  const company = `${read("../src/app/dashboard/company/page.tsx")}\n${read("../src/components/dashboard/Company/CompanyOverviewCards.tsx")}`;
  for (const label of ["Profile readiness", "Company members", "Live listings", "Enquiries handled", "Orders completed", "Capability Request Tracking"]) {
    assert.equal(company.includes(label), true, `missing ${label}`);
  }
});
