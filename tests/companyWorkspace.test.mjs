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
  assert.equal(company.includes("Your first three selections become priorities automatically"), true);
  assert.equal(company.includes("Set as priority"), false);
  assert.equal(company.includes("Select 1–6 categories"), true);
  assert.equal(company.includes("getCompanyFunctionPerspectiveDescription(capability?.slug, kind, capability?.description)"), true);
  assert.equal(company.includes("line-clamp-2"), true);
  assert.equal(company.includes('className="mt-3 grid grid-cols-2 gap-2"'), true);
});

test("capability descriptions use perspective copy with safe fallbacks", async () => {
  const { getCompanyFunctionPerspectiveDescription } = await import("../src/utils/companyFunctionDescriptions.ts");
  assert.equal(getCompanyFunctionPerspectiveDescription("packaging", "provided"), "We provide packaging, labeling, or packing services.");
  assert.equal(getCompanyFunctionPerspectiveDescription("packaging", "sought"), "We need packaging, labeling, or packing support.");
  assert.equal(getCompanyFunctionPerspectiveDescription("future-function", "provided", "API description"), "API description");
  assert.equal(getCompanyFunctionPerspectiveDescription("future-function", "sought"), "We are seeking this capability from customers or partners.");
});

test("My Company exposes operational overview sections", () => {
  const company = `${read("../src/app/dashboard/company/page.tsx")}\n${read("../src/components/dashboard/Company/CompanyOverviewCards.tsx")}`;
  for (const label of ["Profile readiness", "Company members", "Live listings", "Enquiries handled", "Orders completed", "Capability Request Tracking"]) {
    assert.equal(company.includes(label), true, `missing ${label}`);
  }
});
