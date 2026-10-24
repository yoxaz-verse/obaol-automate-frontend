import assert from "node:assert/strict";
import test from "node:test";
import ts from "typescript";
import vm from "node:vm";
import fs from "node:fs";

const source = fs.readFileSync(
  new URL("../src/features/catalog/rates/adapters.ts", import.meta.url),
  "utf8",
);
const output = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const module = { exports: {} };
vm.runInNewContext(output, { module, exports: module.exports });
const { adaptRows, adaptRatePage, adaptMutationRecord, asIdentifier } = module.exports;

test("adapts supported legacy list envelopes", () => {
  const row = { _id: "rate-1" };
  assert.equal(adaptRows({ data: { data: { data: [row] } } })[0]._id, "rate-1");
  assert.equal(adaptRows({ data: { docs: [row] } })[0]._id, "rate-1");
  assert.equal(adaptRows([row])[0]._id, "rate-1");
});

test("malformed list envelopes safely produce an empty list", () => {
  assert.equal(adaptRows({ data: "invalid" }).length, 0);
  assert.equal(adaptRows(null).length, 0);
});

test("adapts pagination and mutation envelopes", () => {
  const page = adaptRatePage({
    data: { data: { data: [{ id: "1" }], meta: { page: 2, totalPages: 4 } } },
  });
  assert.equal(page.rows.length, 1);
  assert.equal(page.meta.page, 2);
  assert.equal(page.meta.totalPages, 4);
  assert.equal(adaptMutationRecord({ data: { data: { id: "created" } } }).id, "created");
});

test("normalizes string and object identifiers", () => {
  assert.equal(asIdentifier("direct"), "direct");
  assert.equal(asIdentifier({ _id: "nested" }), "nested");
  assert.equal(asIdentifier({}), "");
});
