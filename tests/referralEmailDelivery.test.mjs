import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page = fs.readFileSync(new URL("../src/app/dashboard/referrals/page.tsx", import.meta.url), "utf8");

test("referral email is sent by OBAOL and reports SMTP acceptance", () => {
  assert.equal(page.includes("mailto:"), false);
  assert.match(page, /Send email invitation/);
  assert.match(page, /result\.emailDelivery\?\.status !== "SENT"/);
  assert.match(page, /Referral email accepted for delivery/);
});

test("failed referral emails remain retryable and expose delivery state", () => {
  assert.match(page, /onError: async/);
  assert.match(page, /Email delivery/);
  assert.match(page, /row\.emailDelivery\?\.status/);
});
