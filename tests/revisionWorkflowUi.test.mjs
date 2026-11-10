import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const page = readFileSync(new URL("../src/app/dashboard/enquiries/[id]/page.tsx", import.meta.url), "utf8");

test("revision hub renders from explicit round state", () => {
  assert.match(page, /const isRevisionOpen = activeRevisionStatus === "OPEN"/);
  assert.match(page, /const isRevisionClosed = activeRevisionStatus === "CONFIRMED" \|\| activeRevisionStatus === "SKIPPED"/);
  assert.match(page, /!openRevisionRound && normalizedStageKey === "QUOTATION_REVISION"/);
});

test("seller and buyer actions are gated by persisted decisions", () => {
  assert.match(page, /isRevisionOpen && !supplierResponseSubmitted && canSupplierRevision/);
  assert.match(page, /supplierResponseSubmitted && canBuyerRevision/);
  assert.match(page, /!supplierResponseSubmitted && canBuyerRevision/);
});

test("closed rounds are read-only and offer buyer redo", () => {
  assert.match(page, /This round is read-only/);
  assert.match(page, />\s*Redo Revision\s*</);
  assert.match(page, /actionKey: "RETURN_TO_REVISION"/);
});
