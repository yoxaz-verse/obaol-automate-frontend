import assert from "node:assert/strict";
import test from "node:test";

import { resolveMarketplaceSort } from "../src/utils/marketplaceSort.ts";

test("sorts live marketplace listings by oldest last-live date first", () => {
  assert.equal(resolveMarketplaceSort(true), "lastLiveDate:asc");
  assert.equal(resolveMarketplaceSort("true"), "lastLiveDate:asc");
});

test("sorts past marketplace listings by newest last-live date first", () => {
  assert.equal(resolveMarketplaceSort(false), "lastLiveDate:desc");
  assert.equal(resolveMarketplaceSort("false"), "lastLiveDate:desc");
});
