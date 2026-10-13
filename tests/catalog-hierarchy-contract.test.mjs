import assert from "node:assert/strict";
import test from "node:test";
import { normalizeCatalogSearch } from "../src/utils/catalogHierarchyContract.ts";

test("catalog search is case-insensitive and ignores surrounding whitespace", () => {
  assert.equal(normalizeCatalogSearch("  AgRi  "), "agri");
  assert.equal(normalizeCatalogSearch("agri"), normalizeCatalogSearch("AGRI"));
});

test("catalog search normalizes compatible unicode letter forms", () => {
  assert.equal(normalizeCatalogSearch("ＡＧＲＩ"), "agri");
});
