import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const page = readFileSync(new URL("../src/app/dashboard/enquiries/[id]/page.tsx", import.meta.url), "utf8");
const modalStart = page.indexOf("{/* Conversion Modal */}");
const modalEnd = page.indexOf("<QuickCreateWarehouseModal", modalStart);
const modal = page.slice(modalStart, modalEnd);

test("conversion modal uses theme-aware, high-contrast text and surfaces", () => {
  assert.notEqual(modalStart, -1);
  assert.notEqual(modalEnd, -1);
  assert.match(modal, /base: "bg-content1 text-foreground border border-divider/);
  assert.match(modal, />Convert to Order<\/span>/);
  assert.match(modal, /text-default-800 tracking-widest/);
  assert.match(modal, /input: "text-\[12px\] font-bold text-foreground placeholder:text-default-500"/);
  assert.match(modal, /text-default-600 hover:text-foreground hover:bg-default-100/);
});

test("conversion modal content avoids theme-incompatible white surfaces and text", () => {
  const contentStart = modal.indexOf("<ModalContent>");
  const content = modal.slice(contentStart);

  assert.doesNotMatch(content, /text-white(?:\/|\s|\")/);
  assert.doesNotMatch(content, /bg-white(?:\/|\s|\")/);
  assert.doesNotMatch(content, /border-white(?:\/|\s|\")/);
  assert.doesNotMatch(content, /bg-black(?:\/|\s|\")/);
});
