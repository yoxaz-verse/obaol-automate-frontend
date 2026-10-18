import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page = fs.readFileSync(new URL("../src/app/dashboard/bidding/page.tsx", import.meta.url), "utf8");
const access = fs.readFileSync(new URL("../src/utils/dashboardAccess.ts", import.meta.url), "utf8");
const sidebar = fs.readFileSync(new URL("../src/utils/utils.tsx", import.meta.url), "utf8");

test("bidding is registered in access policy and sidebar", () => {
  assert.match(access, /path: "\/dashboard\/bidding"/);
  assert.match(sidebar, /link: "\/dashboard\/bidding"/);
});

test("bidding workspace communicates sealed pricing and supports both roles", () => {
  assert.match(page, /Offer identities and prices unlock only after closing/);
  assert.match(page, /Buying events/);
  assert.match(page, /Seller opportunities/);
  assert.match(page, /Review draft/);
  assert.match(page, /Confirm enquiry/);
});
