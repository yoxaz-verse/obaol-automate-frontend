import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const page = read("src/app/dashboard/orders/[id]/page.tsx");
const timeline = read("src/components/dashboard/orders/OrderStageTimeline.tsx");
const select = read("src/components/ui/AppSelect.tsx");

test("order workspace uses the shared stable select and extracted timeline", () => {
  assert.match(page, /import AppSelect/);
  assert.match(page, /import OrderStageTimeline/);
  assert.match(page, /<OrderStageTimeline stages=\{workflowStageOptions\}/);
  assert.ok((page.match(/<AppSelect/g) || []).length >= 2);
  assert.match(page, /aria-label=\{`\$\{resp\.label\} authority`\}/);
});

test("order progress rail is semantic, scrollable and focuses the current stage", () => {
  assert.match(timeline, /<ol/);
  assert.match(timeline, /aria-label="Order progress"/);
  assert.match(timeline, /aria-current=\{current \? "step"/);
  assert.match(timeline, /overflow-x-auto/);
  assert.match(timeline, /snap-mandatory/);
  assert.match(timeline, /rail\.scrollTo/);
  assert.match(timeline, /Stage \{activeIndex \+ 1\} of \{stages\.length\}/);
});

test("shared select prevents animated layout flashes and bounds its menu", () => {
  assert.match(select, /disableAnimation/);
  assert.match(select, /placement: "bottom-start"/);
  assert.match(select, /shouldFlip: true/);
  assert.match(select, /menuMaxHeight = 320/);
  assert.match(select, /overflowY: "auto"/);
  assert.match(select, /min-w-\[var\(--trigger-width\)\]/);
});
