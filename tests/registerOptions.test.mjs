import assert from "node:assert/strict";
import test from "node:test";

import {
  parseRegisterOptionsResponse,
  REGISTER_OPTIONS_TIMEOUT_MS,
  COMPANY_FUNCTION_TAXONOMY_COUNT,
  COMPANY_FUNCTION_TAXONOMY_VERSION,
} from "../src/utils/registerOptions.ts";

const sampleOptions = {
  designations: [{ _id: "designation-1", name: "Director" }],
  states: [{ _id: "state-1", name: "Kerala" }],
  districts: [{ _id: "district-1", name: "Ernakulam" }],
  divisions: [{ _id: "division-1", name: "Ernakulam Division" }],
  pincodeEntries: [],
  countries: [{ _id: "country-1", name: "India" }],
  companyFunctions: [{ _id: "function-1", name: "Sourcing" }],
  companySubFunctions: [{ _id: "sub-function-1", name: "Supplier Discovery" }],
};

test("registration options allow slow production responses", () => {
  assert.equal(REGISTER_OPTIONS_TIMEOUT_MS, 30_000);
  assert.equal(COMPANY_FUNCTION_TAXONOMY_VERSION, 3);
  assert.equal(COMPANY_FUNCTION_TAXONOMY_COUNT, 11);
});

test("parses company-function taxonomy metadata", () => {
  const parsed = parseRegisterOptionsResponse({
    success: true,
    data: sampleOptions,
    meta: {
      partial: false,
      failedKeys: [],
      companyFunctionTaxonomy: { version: 3, expectedCount: 11, returnedCount: 11 },
    },
  });
  assert.deepEqual(parsed.meta.companyFunctionTaxonomy, { version: 3, expectedCount: 11, returnedCount: 11 });
});

test("parses the standard registration-options envelope", () => {
  const parsed = parseRegisterOptionsResponse({
    success: true,
    data: sampleOptions,
    meta: { partial: false, failedKeys: [] },
  });

  assert.equal("companyTypes" in parsed, false);
  assert.equal("existingCompanies" in parsed, false);
  assert.deepEqual(parsed.divisions, sampleOptions.divisions);
  assert.deepEqual(parsed.meta, { partial: false, failedKeys: [] });
});

test("parses a nested data envelope and its metadata", () => {
  const parsed = parseRegisterOptionsResponse({
    data: {
      data: sampleOptions,
      meta: { partial: true, failedKeys: ["designations"], error: "lookup failed" },
    },
  });

  assert.deepEqual(parsed.companyFunctions, sampleOptions.companyFunctions);
  assert.deepEqual(parsed.meta, {
    partial: true,
    failedKeys: ["designations"],
    error: "lookup failed",
  });
});

test("normalizes missing and malformed option collections without discarding valid ones", () => {
  const parsed = parseRegisterOptionsResponse({
    data: {
      countries: sampleOptions.countries,
      districts: null,
      divisions: "invalid",
    },
    meta: { failedKeys: ["districts", "divisions", null] },
  });

  assert.deepEqual(parsed.countries, sampleOptions.countries);
  assert.deepEqual(parsed.districts, []);
  assert.deepEqual(parsed.divisions, []);
  assert.deepEqual(parsed.meta, {
    partial: true,
    failedKeys: ["districts", "divisions"],
  });
});
