import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const directoryPath = new URL("../src/app/dashboard/quality-labs/page.tsx", import.meta.url);
const wizardPath = new URL("../src/app/dashboard/quality-labs/location/page.tsx", import.meta.url);
const searchablePath = new URL("../src/components/ui/SearchableSelect.tsx", import.meta.url);
const mapPath = new URL("../src/components/Labs/QualityLabsMap.tsx", import.meta.url);

test("lab directory toggles between map and card views with distinct empty states", async () => {
  const source = await readFile(directoryPath, "utf8");
  assert.match(source, /payload\.markers/);
  assert.match(source, /useState<"map" \| "cards">\("map"\)/);
  assert.match(source, />Map view<\/Button>/);
  assert.match(source, />Card view<\/Button>/);
  assert.match(source, /aria-pressed=\{viewMode === "map"\}/);
  assert.match(source, /aria-pressed=\{viewMode === "cards"\}/);
  assert.match(source, /viewMode === "map" \? <>/);
  assert.match(source, /<QualityLabsMap/);
  assert.match(source, /labs\.map/);
  assert.match(source, /viewMode === "cards" \? "success" : "default"/);
  assert.match(source, /No labs match these filters/);
  assert.match(source, /No published labs are available yet/);
  assert.match(source, /Map location not supplied/);
});

test("lab controls are searchable, multi-selectable and accessible", async () => {
  const source = await readFile(searchablePath, "utf8");
  assert.match(source, /Search options/);
  assert.match(source, /Select all/);
  assert.match(source, /role="listbox"/);
  assert.match(source, /aria-multiselectable/);
  assert.match(source, /aria-label=\{label\}/);
  assert.match(source, /getBoundingClientRect\(\)\.width/);
  assert.match(source, /width: menuWidth/);
  const selectedChips = source.indexOf("{multiple && selected.length ? (");
  const selectTrigger = source.indexOf("<Popover");
  assert.notEqual(selectedChips, -1);
  assert.notEqual(selectTrigger, -1);
  assert.equal(selectedChips < selectTrigger, true, "selected chips should render above the select field");
});

test("wizard uses searchable fields and direct taxonomy creation", async () => {
  const source = await readFile(wizardPath, "utf8");
  assert.match(source, /SearchableSelect label="Physical country"/);
  assert.match(source, /SearchableSelect label="Target countries"/);
  assert.match(source, /Add \{requestModal\.kind\.toLowerCase\(\)\}/);
  assert.match(source, /Add and select/);
  assert.match(source, /Country product coverage/);
  assert.doesNotMatch(source, /Request missing option/);
  assert.doesNotMatch(source, /window\.prompt/);
  assert.match(source, /sticky bottom-3/);
});

test("lab map fits all markers when no search point is active", async () => {
  const source = await readFile(mapPath, "utf8");
  assert.match(source, /function FitLabBounds/);
  assert.match(source, /map\.fitBounds/);
  assert.match(source, /Requires mapping/);
});
