import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const page = fs.readFileSync("src/app/dashboard/orders/[id]/page.tsx", "utf8");
const panels = fs.readFileSync("src/components/dashboard/orders/OrderWorkspacePanels.tsx", "utf8");

test("order details exposes the execution workspace navigation", () => {
  for (const anchor of ["#overview", "#execution", "#payments", "#order-docs"]) {
    assert.ok(page.includes(`href=\"${anchor}\"`), `missing ${anchor} workspace navigation`);
  }
  assert.match(page, /OrderOverviewPanel/);
  assert.match(page, /OrderPaymentsPanel/);
});

test("internal staffing is permission gated and opened from internal controls", () => {
  assert.match(page, /roleLower === \"admin\" \|\| roleLower === \"operator\" \|\| roleLower === \"team\"/);
  assert.match(page, /Internal order controls/);
  assert.match(page, /Ratings must be whole numbers from 1 to 5/);
});

test("deal and payment panels expose traceability and settlement actions", () => {
  assert.match(panels, /Open source enquiry/);
  assert.match(panels, /Captured at conversion/);
  assert.match(panels, /Mark paid/);
  assert.match(panels, /Reopen/);
});
