import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const page = readFileSync(
  fileURLToPath(new URL("../src/app/dashboard/enquiries/[id]/page.tsx", import.meta.url)),
  "utf8"
);

test("supplier acceptance loads districts for the inline warehouse state", () => {
  assert.match(
    page,
    /\[executionContext\.originState, executionContext\.destinationState, inlineStateId\]\.filter\(Boolean\)/
  );
  assert.match(
    page,
    /\[executionContext\.originState, executionContext\.destinationState, inlineStateId\]\s*\n\s*\)/
  );
  assert.match(page, /queryKey: \["districts", districtStateIds\.join\("\|"\)\]/);
  assert.match(page, /state: districtStateIds/);
  assert.match(page, /enabled: districtStateIds\.length > 0/);
});

test("changing the inline warehouse state clears the selected district", () => {
  assert.match(
    page,
    /setInlineStateId\(id\);\s*setInlineDistrictId\(""\);/
  );
});

test("district options remain scoped to origin, destination, and inline states", () => {
  assert.match(page, /const originDistrictOptions = districts\.filter/);
  assert.match(page, /const destinationDistrictOptions = districts\.filter/);
  assert.match(page, /const inlineDistrictOptions = districts\.filter/);
});
