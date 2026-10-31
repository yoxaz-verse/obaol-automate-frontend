import assert from "node:assert/strict";
import test from "node:test";
import { filterCatalogHierarchyOptions, normalizeCatalogSearch } from "../src/utils/catalogHierarchyContract.ts";

const options = [
  { id: "1", name: "Coconut" },
  { id: "2", name: "Coffee" },
  { id: "3", name: "Confectionary and bakery" },
  { id: "4", name: "Jaggery" },
];

test("catalog search is case-insensitive and ignores surrounding whitespace", () => {
  assert.equal(normalizeCatalogSearch("  AgRi  "), "agri");
  assert.equal(normalizeCatalogSearch("agri"), normalizeCatalogSearch("AGRI"));
});

test("catalog search normalizes compatible unicode letter forms", () => {
  assert.equal(normalizeCatalogSearch("ＡＧＲＩ"), "agri");
});

test("catalog hierarchy options filter by normalized partial name", () => {
  assert.deepEqual(filterCatalogHierarchyOptions(options, "  COF  ").map((option) => option.id), ["2"]);
  assert.deepEqual(filterCatalogHierarchyOptions([{ id: "5", name: "ＡＧＲＩ" }], "agri").map((option) => option.id), ["5"]);
});

test("catalog hierarchy option filtering returns all or no options as appropriate", () => {
  assert.deepEqual(filterCatalogHierarchyOptions(options, "").map((option) => option.id), ["1", "2", "3", "4"]);
  assert.deepEqual(filterCatalogHierarchyOptions(options, "kk"), []);
});
