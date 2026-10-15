import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { resolveMarketplaceSort } from "../src/utils/marketplaceSort.ts";

test("sorts live marketplace listings by newest last-live date first", () => {
  assert.equal(resolveMarketplaceSort(true), "lastLiveDate:desc");
  assert.equal(resolveMarketplaceSort("true"), "lastLiveDate:desc");
});

test("sorts past marketplace listings by newest last-live date first", () => {
  assert.equal(resolveMarketplaceSort(false), "lastLiveDate:desc");
  assert.equal(resolveMarketplaceSort("false"), "lastLiveDate:desc");
});

test("uses the marketplace sort for the displayed query and every prefetched page", () => {
  const source = readFileSync(
    "src/components/dashboard/Catalog/variant-rate.tsx",
    "utf8",
  );
  assert.equal(
    source.match(/isMarketplaceView && \{ sort: marketplaceSort \}/g)?.length,
    3,
  );
});
