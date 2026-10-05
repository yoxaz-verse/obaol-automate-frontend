import assert from "node:assert/strict";
import test from "node:test";

import {
  applyProductionMethod,
  productionMethodFlags,
  resolveProductionMethod,
} from "../src/utils/productClassification.ts";

test("defaults an unclassified product to conventional", () => {
  assert.deepEqual(resolveProductionMethod({}), { method: "conventional", hasConflict: false });
});

for (const method of ["conventional", "natural", "organic", "ipm"]) {
  test(`maps ${method} to exactly one persisted farming flag`, () => {
    const flags = productionMethodFlags(method);
    assert.equal(Object.values(flags).filter(Boolean).length, 1);
    assert.deepEqual(resolveProductionMethod(flags), { method, hasConflict: false });
  });
}

test("flags conflicting legacy farming values for review", () => {
  assert.deepEqual(
    resolveProductionMethod({ isNatural: true, isOrganic: true }),
    { method: null, hasConflict: true },
  );
});

test("changing farming method preserves the independent GI Tag selection", () => {
  const updated = applyProductionMethod({ isGiTagged: true }, "organic");
  assert.equal(updated.isGiTagged, true);
  assert.equal(updated.isOrganic, true);
  assert.equal(Object.values(productionMethodFlags("organic")).filter(Boolean).length, 1);
});
