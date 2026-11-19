import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("packaging unit setup uses URL-backed pages instead of a modal", async () => {
  const list = await read("src/app/dashboard/packaging/my/page.tsx");
  const editor = await read("src/components/packaging/PackagingUnitEditor.tsx");
  assert.doesNotMatch(list, /fixed inset-0 z-50/);
  assert.match(list, /dashboard\/packaging\/my\/\$\{id \|\| "new"\}/);
  for (const step of ["details", "location", "capabilities", "review"]) assert.match(editor, new RegExp(`key: "${step}"`));
  assert.match(editor, /unitDrafts/);
  assert.match(editor, /Submit for review/);
});

test("packaging location uses the shared map picker", async () => {
  const editor = await read("src/components/packaging/PackagingUnitEditor.tsx");
  assert.match(editor, /<LocationSelector required disabled=\{locked\} countryCode="IN"/);
  assert.match(editor, /onChange=\{setPhysicalLocation\}/);
  assert.match(editor, /isValidCoordinate\(loc\?\.latitude, loc\?\.longitude\)/);
  assert.doesNotMatch(editor, /<Input label="Latitude"/);
  assert.doesNotMatch(editor, /<Input label="Longitude"/);
});

test("packaging capabilities use interactive searchable selectors with clear guidance", async () => {
  const editor = await read("src/components/packaging/PackagingUnitEditor.tsx");
  assert.match(editor, /import SearchableSelect/);
  assert.match(editor, /<SearchableSelect label=\{field\.label\}/);
  assert.doesNotMatch(editor, /<select multiple/);
  assert.match(editor, /Choose the packaging services you provide/);
  assert.match(editor, /Choose the agricultural commodities you can package/);
  assert.match(editor, /Quantity unit/);
  assert.match(editor, /Notes \/ custom options/);
  assert.match(editor, /Request a new/);
  assert.match(editor, /pb-28 sm:pb-20/);
});

test("packaging capability validation preserves optional numeric editing and normalizes drafts", async () => {
  const editor = await read("src/components/packaging/PackagingUnitEditor.tsx");
  assert.match(editor, /value === "" \? "" : Number\(value\)/);
  assert.match(editor, /normalizedSnapshot\(form\)/);
  assert.match(editor, /positive whole number of days/);
  assert.match(editor, /Capability \$\{index \+ 1\}/);
});
