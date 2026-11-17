import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (relative) => readFileSync(fileURLToPath(new URL(relative, import.meta.url)), "utf8");

test("Warehouse Directory uses product language instead of terminal language", () => {
  const page = read("../src/app/dashboard/warehouse-rent/page.tsx");
  assert.match(page, /title="Warehouse Contact Directory"/);
  assert.match(page, /Loading warehouses…/);
  assert.match(page, /No warehouses match these filters\./);
  assert.doesNotMatch(page, /Operations_Terminal|Node_Catalog|Initializing_Nodes|No_Available_Capacity_Detected|Nodes Found/);
});

test("shared user-facing flows avoid retired decorative status copy", () => {
  const sources = [
    "../src/components/ui/BrandedLoader.tsx",
    "../src/components/Login/otp-verification.tsx",
    "../src/app/dashboard/imports/page.tsx",
    "../src/app/dashboard/approvals/page.tsx",
    "../src/app/dashboard/sample-requests/page.tsx",
    "../src/app/dashboard/sample-requests/[id]/page.tsx",
    "../src/components/dashboard/Company/OnboardingModal.tsx",
  ].map(read).join("\n");

  assert.doesNotMatch(
    sources,
    /MISSION_SUCCESS|Operations_Terminal|Node_Catalog|Initializing Protocol|Mission Parameters|Mission Volume|System Empty|Decision Telemetry|Verify Protocol Access|Return to Mission Control/
  );
});
