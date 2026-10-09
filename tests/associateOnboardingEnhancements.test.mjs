import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

test("associate onboarding keeps company search behind a three-character query", () => {
  const form = read("../src/components/onboarding/AssociateOnboardingForm.tsx");
  const service = read("../../obaol-automate-backend/src/services/authService.ts");
  assert.equal(form.includes("debouncedCompanySearch.length >= 3"), true);
  assert.equal(form.includes("Type at least 3 letters to search"), true);
  assert.equal(form.includes("isOpen={isCompanySearchOpen && canShowCompanySearchResults}"), true);
  assert.equal(form.includes("normalizedCompanySearch.length < 3"), true);
  assert.equal(service.includes("if (query.length < 3)"), true);
  assert.equal(service.includes(".limit(20)"), true);
});

test("associate onboarding scopes a single blue focus treatment to its fields", () => {
  const form = read("../src/components/onboarding/AssociateOnboardingForm.tsx");
  const styles = read("../src/app/globals.css");
  assert.equal(form.includes("associate-onboarding-form"), true);
  assert.equal(styles.includes("--associate-focus: #006fee"), true);
  assert.equal(styles.includes(".associate-onboarding-form :is(input, textarea):focus-visible"), true);
  assert.equal(styles.includes('[data-slot="input-wrapper"]'), true);
});

test("associate onboarding captures independent provided and sought capability profiles", () => {
  const form = read("../src/components/onboarding/AssociateOnboardingForm.tsx");
  for (const token of [
    "What your company provides",
    "What your company is seeking",
    "providedFunctionIds",
    "soughtFunctionIds",
    "providedFunctionPriorities",
    "soughtFunctionPriorities",
  ]) assert.equal(form.includes(token), true, `missing ${token}`);
  assert.equal(form.includes("Type of Entity"), false);
  assert.equal(form.includes('buying: <IoCart />'), true);
  assert.equal(form.includes('selling: <IoStorefront />'), true);
  assert.equal(form.includes('className="grid grid-cols-2 gap-2"'), true);
  assert.equal(form.includes("Build a clearer company profile"), true);
  assert.equal(form.includes('href="/dashboard/company"'), true);
});

test("associate onboarding removes duplicate participation modes", () => {
  const form = read("../src/components/onboarding/AssociateOnboardingForm.tsx");
  assert.equal(form.includes("How will your company participate?"), false);
  assert.equal(form.includes("tradeMode:"), false);
  assert.equal(form.includes('"importing-to-india"'), true);
  assert.equal(form.includes('"exporting-from-india"'), true);
  assert.equal(form.includes("Make priority"), true);
  assert.equal(form.includes("Your first three selections become priorities"), false);
});

test("My Company edits and submits split capability profiles", () => {
  const workspace = read("../src/app/dashboard/company/page.tsx");
  for (const token of [
    "requestedProvidedFunctionIds",
    "requestedSoughtFunctionIds",
    "requestedProvidedFunctionPriorities",
    "requestedSoughtFunctionPriorities",
    'renderRequestedProfile("provided")',
    'renderRequestedProfile("sought")',
  ]) assert.equal(workspace.includes(token), true, `missing ${token}`);
});

test("registration bootstrap excludes company types and the full company directory", () => {
  const options = read("../src/utils/registerOptions.ts");
  assert.equal(options.includes("existingCompanies"), false);
  assert.equal(options.includes("companyTypes"), false);
});

test("Indian company onboarding captures optional verification identifiers", () => {
  const form = read("../src/components/onboarding/AssociateOnboardingForm.tsx");
  const approvals = read("../src/app/dashboard/approvals/page.tsx");
  const authService = read("../../obaol-automate-backend/src/services/authService.ts");
  const companyModel = read("../../obaol-automate-backend/src/database/models/associateCompany.ts");

  for (const token of [
    "companyGstin",
    "companyIecCode",
    "companyCin",
    "These details will be used to verify your company.",
    "GSTIN Number (Optional)",
    "IEC Code (Optional)",
    "CIN (Optional)",
    "maxLength={15}",
    "maxLength={10}",
    "maxLength={21}",
  ]) assert.equal(form.includes(token), true, `missing ${token}`);

  for (const token of ["iecCode", "cin"]) {
    assert.equal(authService.includes(token), true, `auth payload missing ${token}`);
    assert.equal(companyModel.includes(token), true, `company model missing ${token}`);
    assert.equal(approvals.includes(`row.${token}`), true, `approval UI missing ${token}`);
  }
});
