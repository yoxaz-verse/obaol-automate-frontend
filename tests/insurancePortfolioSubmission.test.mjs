import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync("src/app/dashboard/insurance-partners/my/page.tsx", "utf8");

test("insurance submission sends the current snapshot and synchronizes the returned record", () => {
  assert.match(page, /submitPortfolio,\{snapshot:form\}/);
  assert.match(page, /setQueryData\(\["insurance-portfolio"\],response\?\.data\?\.data\)/);
  assert.match(page, /showToastMessage\(\{type:"success"/);
  assert.match(page, /showToastMessage\(\{type:"error"/);
});

test("insurance list fields retain a raw editing buffer instead of trimming every keystroke", () => {
  assert.match(page, /const \[draft,setDraft\]=useState/);
  assert.match(page, /setDraft\(v\);onChange\(listDraft\(v\)\)/);
  assert.doesNotMatch(page, /onValueChange=\{v=>onChange\(split\(v\)\)\}/);
});

test("save and submit actions are mutually locked while processing", () => {
  assert.match(page, /isDisabled=\{locked\|\|submit\.isPending\}/);
  assert.match(page, /isDisabled=\{locked\|\|save\.isPending\|\|submit\.isPending\}/);
});
