import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const reportsPagePath = fileURLToPath(new URL("../src/app/dashboard/reports/page.tsx", import.meta.url));
const reportsPageSource = readFileSync(reportsPagePath, "utf8");

test("reports review queue defaults to pending submissions in FIFO order", () => {
  assert.match(
    reportsPageSource,
    /useState<StatusFilter>\("PENDING_REVIEW"\)/,
    "the queue should open on pending reports"
  );
  assert.match(
    reportsPageSource,
    /sort: "createdAt:asc"/,
    "the oldest matching report should be returned first"
  );
  assert.doesNotMatch(reportsPageSource, /sort: "createdAt:desc"/);
});

test("reports review queue presents readable workflow labels", () => {
  assert.match(reportsPageSource, /const formatLabel =/);
  assert.match(reportsPageSource, /Oldest first/);
  assert.match(reportsPageSource, /"Open Review" : "View Review"/);
});
