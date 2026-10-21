import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

test("the shared page header supports actions, breadcrumbs, and compatibility props", () => {
  const source = read("src/components/ui/PageHeader.tsx");
  assert.match(source, /actions\?: ReactNode/);
  assert.match(source, /primaryAction\?:/);
  assert.match(source, /secondaryAction\?: ReactNode/);
  assert.match(source, /aria-label="Breadcrumb"/);
  assert.match(source, /aria-current="page"/);
  assert.match(source, /variant\?: "panel" \| "plain"/);
  assert.match(source, /eyebrowTone\?: "brand" \| "success" \| "warning" \| "danger"/);
});

test("shared state components use one server-compatible renderer", () => {
  const state = read("src/components/ui/StateDisplay.tsx");
  const empty = read("src/components/ui/EmptyState.tsx");
  const error = read("src/components/ui/ErrorState.tsx");
  const loading = read("src/components/ui/LoadingState.tsx");

  for (const source of [state, empty, error, loading]) {
    assert.doesNotMatch(source, /["']use client["']/);
    assert.doesNotMatch(source, /from ["']framer-motion["']/);
  }
  assert.match(state, /role=\{variant === "error" \? "alert" : "status"\}/);
  assert.match(state, /aria-busy=\{variant === "loading" \? true : undefined\}/);
  assert.match(state, /motion-safe:animate-pulse/);
  assert.match(empty, /description\?: string/);
  assert.match(error, /onRetry/);
});

test("the first route batch adopts shared headers and states", () => {
  const routes = [
    "src/app/dashboard/reports/page.tsx",
    "src/app/dashboard/commercial-documents/page.tsx",
    "src/app/dashboard/quality-labs/page.tsx",
    "src/app/dashboard/quality-labs/execution/page.tsx",
    "src/app/dashboard/catalog/additions/page.tsx",
    "src/app/dashboard/function-preview/page.tsx",
  ].map(read);

  for (const source of routes) assert.match(source, /<PageHeader/);
  assert.equal(routes.filter((source) => /<EmptyState/.test(source)).length, routes.length);
  assert.equal(routes.filter((source) => /<LoadingState/.test(source)).length, routes.length);
  assert.doesNotMatch(routes.at(-1), /<h1/);
});
