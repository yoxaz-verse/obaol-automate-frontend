import test from "node:test";
import assert from "node:assert/strict";
import { normalizeOperatorCapabilitySummary } from "../src/utils/operatorNavigationCapabilities.ts";

test("malformed capability responses normalize to safe navigation defaults", () => {
  assert.deepEqual(normalizeOperatorCapabilitySummary({
    companyCount: "2",
    providedCapabilities: null,
    soughtCapabilities: ["finance-risk", 42],
    eligibility: [],
  }), {
    companyCount: 2,
    providedCapabilities: [],
    soughtCapabilities: ["finance-risk"],
    eligibility: {},
  });
});
