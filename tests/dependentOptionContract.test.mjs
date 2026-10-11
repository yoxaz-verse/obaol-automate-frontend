import assert from "node:assert/strict";
import test from "node:test";

import {
  buildDependentOptionParams,
  extractDependentOptionRows,
} from "../src/utils/dependentOptionContract.ts";

const rows = [{ _id: "1", name: "Basmati" }];

test("extracts dependent options from every supported API response shape", () => {
  assert.deepEqual(extractDependentOptionRows(rows), rows);
  assert.deepEqual(extractDependentOptionRows({ data: rows }), rows);
  assert.deepEqual(extractDependentOptionRows({ data: { data: rows } }), rows);
  assert.deepEqual(extractDependentOptionRows({ data: { data: { data: rows } } }), rows);
  assert.deepEqual(extractDependentOptionRows({ data: { unexpected: rows } }), []);
});

test("builds the product request with the selected subcategory id", () => {
  assert.deepEqual(buildDependentOptionParams("subCategory", "subcategory-id"), {
    limit: "2000",
    subCategory: "subcategory-id",
  });
});

test("builds the variant request with the selected product id", () => {
  assert.deepEqual(buildDependentOptionParams("product", "product-id"), {
    limit: "2000",
    product: "product-id",
  });
});
