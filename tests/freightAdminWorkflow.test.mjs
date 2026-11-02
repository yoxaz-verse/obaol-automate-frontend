import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("admin approvals expose a dedicated freight workflow", () => {
  const page = read("../src/app/dashboard/approvals/page.tsx");
  assert.match(page, /"freight"/);
  assert.match(page, /title: "Freight Forwarding"/);
  assert.match(page, /freightForwardingRoutes\.approvals/);
  assert.match(page, /<FreightApprovalQueue \/>/);
});

test("freight review shows operational evidence and requires rejection notes", () => {
  const queue = read("../src/components/dashboard/Approvals/FreightApprovalQueue.tsx");
  for (const field of ["modes", "lanes", "services", "specialHandling", "credentials"]) assert.match(queue, new RegExp(field));
  assert.match(queue, /isDisabled=\{!notes\[profile\._id\]\?\.trim\(\)\}/);
  assert.match(queue, /invalidateQueries\(\{ queryKey: \["freight-directory"\] \}\)/);
});

