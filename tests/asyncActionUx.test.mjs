import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

test("shared async actions expose contextual and accessible states", () => {
  const button = read("src/components/ui/AsyncActionButton.tsx");
  const feedback = read("src/components/ui/ActionFeedback.tsx");
  for (const state of ["idle", "validating", "processing", "success", "error"]) assert.match(button, new RegExp(`"${state}"`));
  assert.match(button, /aria-busy/);
  assert.match(button, /aria-live="polite"/);
  assert.match(button, /min-w-\[12rem\]/);
  assert.match(feedback, /aria-live=\{isError \? "assertive" : "polite"\}/);
  assert.match(feedback, /role=\{isError \? "alert" : "status"\}/);
});

test("supplier acceptance uses one contextual idempotent request", () => {
  const page = read("src/app/dashboard/enquiries/[id]/page.tsx");
  assert.match(page, /Reserving Stock & Accepting Enquiry…/);
  assert.match(page, /Enquiry Accepted Successfully/);
  assert.match(page, /Unable to Accept Enquiry — Retry/);
  assert.match(page, /idempotencyKey: acceptIdempotencyKey\.current/);
  assert.doesNotMatch(page, /Finally Accept with the target inventory/);
});

test("shared destructive and warehouse workflows use contextual async actions", () => {
  const deletion = read("src/components/CurdTable/delete.tsx");
  const warehouse = read("src/components/Warehouse/QuickCreateWarehouseModal.tsx");
  assert.match(deletion, /Deleting Record…/);
  assert.match(deletion, /Record Deleted/);
  assert.match(warehouse, /Creating Warehouse…/);
  assert.match(warehouse, /Warehouse Created/);
});
