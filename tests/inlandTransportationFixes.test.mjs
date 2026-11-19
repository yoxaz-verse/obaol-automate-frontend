import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("truck directory renders published trucks without requiring a map marker", () => {
  const source = read("../src/app/dashboard/inland-transportation/directory/page.tsx");
  assert.match(source, /markers\.length \?[^:]+TruckMap/s);
  assert.match(source, /Approximate location is temporarily unavailable/);
  assert.match(source, /shown as cards/);
});

test("trip ETA uses a non-overlapping outside label", () => {
  const source = read("../src/app/dashboard/inland-transportation/trips/[id]/page.tsx");
  assert.match(source, /label="Estimated arrival" labelPlacement="outside"/);
  assert.match(source, /inputWrapper:"min-h-12"/);
});

test("transport opportunities expose authorized management controls", () => {
  const source = read("../src/app/dashboard/inland-transportation/opportunities/page.tsx");
  for (const control of ["Refresh", "View details", "Submit bid", "Revise bid", "Update sealed bid"]) assert.match(source, new RegExp(control));
  assert.match(source, /Bidding controls are closed/);
});
