import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page = fs.readFileSync(new URL("../src/app/dashboard/bidding/page.tsx", import.meta.url), "utf8");
const buyerPage = fs.readFileSync(new URL("../src/app/dashboard/bidding/my/page.tsx", import.meta.url), "utf8");
const access = fs.readFileSync(new URL("../src/utils/dashboardAccess.ts", import.meta.url), "utf8");
const sidebar = fs.readFileSync(new URL("../src/utils/utils.tsx", import.meta.url), "utf8");

test("buyer and seller bidding workspaces are registered independently", () => {
  assert.match(access, /path: "\/dashboard\/bidding"/);
  assert.match(access, /path: "\/dashboard\/bidding\/my"/);
  assert.match(sidebar, /link: "\/dashboard\/bidding"/);
  assert.match(sidebar, /link: "\/dashboard\/bidding\/my"/);
});

test("bidding workspace fixes the seller page and buyer page to separate modes", () => {
  assert.match(page, /Offer identities and prices unlock only after closing/);
  assert.match(page, /Available/);
  assert.match(page, /Participating/);
  assert.match(page, /History/);
  assert.match(page, /Create buying request/);
  assert.match(page, /Variant \/ Grade/);
  assert.match(page, /productVariant/);
  assert.match(page, /isDismissable=\{false\}/);
  assert.match(page, /Review draft/);
  assert.match(page, /Confirm enquiry/);
  assert.match(buyerPage, /fixedMode="buyer"/);
});
