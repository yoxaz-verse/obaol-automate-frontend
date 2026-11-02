import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("role pages load published scenario cards and keep them out of static role data", () => {
  const rolePage = read("src/app/roles/associate/[roleSlug]/page.tsx");
  assert.match(rolePage, /getPublishedRoleScenarios/);
  assert.match(rolePage, /Real-Life Scenarios for/);
  assert.match(rolePage, /real-life-scenarios\/\$\{scenario\.slug\}/);
});

test("story pages are server rendered with article, breadcrumb and FAQ schema", () => {
  const page = read("src/app/roles/associate/[roleSlug]/real-life-scenarios/[storySlug]/page.tsx");
  assert.doesNotMatch(page, /"use client"/);
  assert.match(page, /"@type": "Article"/);
  assert.match(page, /"@type": "BreadcrumbList"/);
  assert.match(page, /"@type": "FAQPage"/);
  assert.match(page, /generateMetadata/);
});

test("preview is explicitly noindex and sitemap includes published scenario records", () => {
  const preview = read("src/app/roles/associate/[roleSlug]/real-life-scenarios/preview/[id]/page.tsx");
  const sitemap = read("src/app/sitemap.ts");
  assert.match(preview, /index: false/);
  assert.match(preview, /follow: false/);
  assert.match(sitemap, /getAllPublishedScenarios/);
  assert.match(sitemap, /scenario\.updatedAt/);
});

test("admin editor exposes structured blocks and controlled publication", () => {
  const admin = read("src/app/dashboard/real-life-scenarios/page.tsx");
  for (const expected of ["Structured story blocks", "Search preview", "Save draft", "Preview", "Publish", "Schedule", "Archive", "disclosureAccepted"]) assert.match(admin, new RegExp(expected));
});
