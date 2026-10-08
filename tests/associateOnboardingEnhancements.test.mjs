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
  assert.equal(service.includes("if (query.length < 3)"), true);
  assert.equal(service.includes(".limit(20)"), true);
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
});

test("registration bootstrap excludes company types and the full company directory", () => {
  const options = read("../src/utils/registerOptions.ts");
  assert.equal(options.includes("existingCompanies"), false);
  assert.equal(options.includes("companyTypes"), false);
});
