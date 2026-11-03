import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("role pages load published scenario cards and keep them out of static role data", () => {
  const rolePage = read("src/app/roles/associate/[roleSlug]/page.tsx");
  assert.match(rolePage, /getPublishedRoleScenarios/);
  assert.match(rolePage, /Real-Life Scenarios for/);
  assert.match(rolePage, /real-life-scenarios\/\$\{scenario\.slug\}/);
  assert.doesNotMatch(rolePage, /getPublishedRoleScenarios\([^)]*\)\s*\.slice\(/);
});

test("story pages are server rendered with article, breadcrumb and FAQ schema", () => {
  const page = read("src/app/roles/associate/[roleSlug]/real-life-scenarios/[storySlug]/page.tsx");
  const view = read("src/components/public/ScenarioPageView.tsx");
  assert.doesNotMatch(page, /"use client"/);
  assert.match(page, /"@type": "Article"/);
  assert.match(page, /"@type": "BreadcrumbList"/);
  assert.match(page, /"@type": "FAQPage"/);
  assert.match(page, /generateMetadata/);
  assert.doesNotMatch(view, /related\.filter\([^;]+\.slice\(0,\s*3\)/);
});

test("Operator scenarios are server rendered with Operator-specific URLs and schema", () => {
  const rolePage = read("src/app/roles/operator/page.tsx");
  const clientPage = read("src/app/roles/operator/OperatorRolePageClient.tsx");
  const storyPage = read("src/app/roles/operator/real-life-scenarios/[storySlug]/page.tsx");
  const previewPage = read("src/app/roles/operator/real-life-scenarios/preview/[id]/page.tsx");
  assert.doesNotMatch(rolePage, /"use client"/);
  assert.match(rolePage, /getPublishedRoleScenarios\("operator"\)/);
  assert.match(clientPage, /Real-Life Scenarios for Operators/);
  assert.match(clientPage, /scenarios\.map/);
  assert.match(storyPage, /getPublishedScenario\("operator"/);
  assert.match(storyPage, /"@type": "Article"/);
  assert.match(storyPage, /"@type": "BreadcrumbList"/);
  assert.match(storyPage, /"@type": "FAQPage"/);
  assert.match(previewPage, /index: false/);
  assert.match(previewPage, /scenario\.roleSlug !== "operator"/);
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
  assert.match(admin, /\{count\?\.total \|\| 0\} created/);
  assert.doesNotMatch(admin, /\/3 created|three scenarios|required three/i);
  assert.match(admin, /scenarioRoleOptions/);
  assert.match(admin, /getScenarioPreviewPath/);
  assert.match(admin, /getScenarioStoryPath/);
});

test("shared scenario paths keep Associate URLs stable and route Operator stories correctly", () => {
  const paths = read("src/data/scenarioRoles.ts");
  const sitemap = read("src/app/sitemap.ts");
  assert.match(paths, /isOperatorScenarioRole\(roleSlug\) \? "\/roles\/operator" : getAssociateRolePath/);
  assert.match(paths, /getScenarioStoryPath/);
  assert.match(sitemap, /getScenarioStoryPath\(scenario\.roleSlug, scenario\.slug\)/);
});

test("public scenario fetches report backend failures instead of failing silently", () => {
  const data = read("src/data/realLifeScenarios.ts");
  assert.match(data, /console\.error\(`\[real-life-scenarios\]/);
  assert.match(data, /failed with HTTP \$\{response\.status\}/);
  assert.match(data, /reportFetchFailure/);
});

test("public stories use the industry-scenario label without defensive disclaimer copy", () => {
  const rolePage = read("src/app/roles/associate/[roleSlug]/page.tsx");
  const view = read("src/components/public/ScenarioPageView.tsx");
  const page = read("src/app/roles/associate/[roleSlug]/real-life-scenarios/[storySlug]/page.tsx");
  assert.match(rolePage, /Real-life scenarios/);
  assert.match(rolePage, /Industry scenario/);
  assert.match(view, /Industry scenario/);
  assert.doesNotMatch(view, /not a customer testimonial|verified case study|guarantee of results/i);
  assert.doesNotMatch(page, /not a customer testimonial|verified case study|guarantee of results/i);
  assert.doesNotMatch(view, /FiInfo/);
});
