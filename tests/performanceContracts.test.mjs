import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("bulk spreadsheet support stays out of the initial CRUD bundle", () => {
  const source = readFileSync("src/components/CurdTable/bulk-add.tsx", "utf8");
  assert.doesNotMatch(source, /^import .* from ["']xlsx["']/m);
  assert.match(source, /await import\(["']xlsx["']\)/);
  assert.match(source, /readAsArrayBuffer/);
});

test("dashboard tiles defer chart libraries until a chart tile renders", () => {
  const source = readFileSync("src/components/dashboard/dashboard-tile.tsx", "utf8");
  assert.doesNotMatch(source, /^import .*Charts\//m);
  assert.match(source, /dynamic\(\(\) => import\("\.\/Charts\/line-chart"\)/);
  assert.match(source, /import\("\.\/Charts\/growth-type-chart"\)/);
});

test("API boundaries expose reusable success, failure, and pagination types", () => {
  const source = readFileSync("src/core/api/types.ts", "utf8");
  assert.match(source, /export type ApiSuccess<T>/);
  assert.match(source, /export type ApiFailure/);
  assert.match(source, /export type PaginatedData<T>/);
});

test("the auth choice screen remains server-rendered without Framer Motion", () => {
  const source = readFileSync("src/components/Auth/AuthEntry.tsx", "utf8");
  assert.doesNotMatch(source, /["']use client["']/);
  assert.doesNotMatch(source, /from ["']framer-motion["']/);
  assert.match(source, /signInView/);
});

test("the public auth chooser skips authenticated data providers", () => {
  const source = readFileSync("src/app/authenticated-provider.tsx", "utf8");
  assert.match(source, /pathname === ["']\/auth["']/);
  assert.match(source, /return children/);
});
