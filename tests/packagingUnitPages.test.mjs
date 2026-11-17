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
