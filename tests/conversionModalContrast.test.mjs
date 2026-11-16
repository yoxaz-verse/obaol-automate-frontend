import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const page = readFileSync(new URL("../src/app/dashboard/enquiries/[id]/page.tsx", import.meta.url), "utf8");
const modalStart = page.indexOf("{/* Conversion Modal */}");
const modalEnd = page.indexOf("<QuickCreateWarehouseModal", modalStart);
const modal = page.slice(modalStart, modalEnd);

test("conversion modal follows the shared dashboard visual language", () => {
  assert.notEqual(modalStart, -1);
  assert.notEqual(modalEnd, -1);
  assert.match(modal, /base: "dashboard-panel bg-content1 text-foreground/);
  assert.match(modal, /<h2[^>]*>Convert to order<\/h2>/);
  assert.match(modal, /className="dashboard-section-title">Responsibilities/);
  assert.match(modal, /<DashboardStatusBadge tone=/);
  assert.match(modal, /<AppButton\s+intent="primary"/);
  assert.match(modal, /"Confirm conversion"/);
  assert.match(modal, /View execution workspace/);
});

test("conversion modal uses professional sentence-case copy", () => {
  assert.doesNotMatch(modal, /COMMAND SEQUENCE INITIATED/);
  assert.doesNotMatch(modal, /FINAL_RESPONSIBILITY_MATRIX/);
  assert.doesNotMatch(modal, /PACKAGING_SPECIFICATIONS/);
  assert.doesNotMatch(modal, /ORDER_CONTEXT_METADATA/);
  assert.doesNotMatch(modal, /ESTABLISH_ORDER_PROTOCOL/);
});

test("conversion modal content avoids theme-incompatible white surfaces and text", () => {
  const contentStart = modal.indexOf("<ModalContent>");
  const content = modal.slice(contentStart);

  assert.doesNotMatch(content, /text-white(?:\/|\s|\")/);
  assert.doesNotMatch(content, /bg-white(?:\/|\s|\")/);
  assert.doesNotMatch(content, /border-white(?:\/|\s|\")/);
  assert.doesNotMatch(content, /bg-black(?:\/|\s|\")/);
});
