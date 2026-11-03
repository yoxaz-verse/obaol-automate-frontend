import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const page = fs.readFileSync(new URL("../src/app/dashboard/gst/page.tsx", import.meta.url), "utf8");
const routes = fs.readFileSync(new URL("../src/core/api/apiRoutes.tsx", import.meta.url), "utf8");

test("GST workspace exposes both returns and all download formats", () => {
  assert.match(page, /GSTR1/);
  assert.match(page, /GSTR3B/);
  for (const format of ["json", "xlsx", "pdf"]) assert.match(page, new RegExp(format));
  assert.match(page, /Request filing OTP/);
});

test("GST API client includes registration, purchase, return, and filing endpoints", () => {
  for (const endpoint of ["registrations", "purchases", "generate", "download", "file", "otp", "status"]) assert.match(routes, new RegExp(endpoint));
});
