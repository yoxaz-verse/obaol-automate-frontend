import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const helper = fs.readFileSync(new URL("../src/utils/companyAccess.ts", import.meta.url), "utf8");
const banner = fs.readFileSync(new URL("../src/components/dashboard/CompanyApprovalBanner.tsx", import.meta.url), "utf8");
const layout = fs.readFileSync(new URL("../src/app/dashboard/layout.tsx", import.meta.url), "utf8");
const axios = fs.readFileSync(new URL("../src/core/api/axiosInstance.tsx", import.meta.url), "utf8");

test("company read-only access is centralized in the authenticated user state", () => {
  assert.match(helper, /companyApproval\?\.actionsAllowed !== true/);
  assert.match(helper, /role.*associate/i);
  assert.match(helper, /registrationStatus.*APPROVED/i);
});

test("dashboard always mounts the company approval banner", () => {
  assert.match(layout, /<CompanyApprovalBanner \/>/);
  assert.match(banner, /data-company-read-only-banner/);
  assert.match(helper, /business actions are disabled until approval/i);
  assert.match(banner, /Contact support/);
});

test("API errors use the stable company approval code and one centralized toast", () => {
  assert.match(axios, /COMPANY_APPROVAL_REQUIRED/);
  assert.match(axios, /toast\.warning/);
  assert.match(axios, /obaol:company-approval-required/);
});
