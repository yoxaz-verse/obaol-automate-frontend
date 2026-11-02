import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("shared metadata produces absolute branded titles and canonical URLs", () => {
  const seo = read("src/utils/seo.ts");
  assert.match(seo, /title: \{ absolute: title \}/);
  assert.match(seo, /alternates: \{ canonical \}/);
  assert.match(seo, /B2B bulk trade execution platform/);
});

test("homepage owns the primary bulk trade intent and one active server H1", () => {
  const page = read("src/app/page.tsx");
  const hero = read("src/components/home/HeroSectionServer.tsx");
  assert.match(page, /B2B Bulk Trade Execution Platform \| OBAOL Supreme/);
  assert.match(page, /domestic and international agricultural commodity trade/);
  assert.equal((hero.match(/<h1\b/g) || []).length, 1);
  assert.match(hero, /The B2B Bulk Trade/);
  assert.match(hero, /Execution Platform/);
});

test("indexable public utility routes use the Metadata API", () => {
  for (const [path, canonical] of [
    ["src/app/export-resources/layout.tsx", "/export-resources"],
    ["src/app/commission-structure/layout.tsx", "/commission-structure"],
    ["src/app/methods/layout.tsx", "/methods"],
  ]) {
    const source = read(path);
    assert.match(source, /buildMetadata\(/);
    assert.ok(source.includes(`path: "${canonical}"`));
  }
});

test("private routes expose server-owned noindex metadata", () => {
  for (const path of [
    "src/app/dashboard/layout.tsx",
    "src/app/auth/layout.tsx",
    "src/app/developer/layout.tsx",
    "src/app/verification-pending/layout.tsx",
    "src/app/documents/share/layout.tsx",
  ]) {
    const source = read(path);
    assert.match(source, /index: false/);
    assert.match(source, /follow: false/);
  }
});

test("sitemap contains only intended public routes and uses real scenario modification dates", () => {
  const sitemap = read("src/app/sitemap.ts");
  assert.match(sitemap, /lastModified: scenario\.updatedAt/);
  assert.doesNotMatch(sitemap, /lastModified: new Date\(\)/);
  assert.match(sitemap, /commission-structure/);
  assert.match(sitemap, /methods/);
  for (const excluded of ["/auth", "/dashboard", "/developer", "/trade-directory", "/product"]) {
    assert.equal(sitemap.includes(`\`${"${baseUrl}"}${excluded}`), false);
  }
});

test("robots lets crawlers observe private noindex while excluding APIs", () => {
  const robots = read("src/app/robots.ts");
  assert.match(robots, /disallow: \["\/api", "\/api\/\*"\]/);
  assert.doesNotMatch(robots, /"\/dashboard|"\/auth|"\/developer/);
  assert.match(robots, /sitemap: `\$\{BASE_URL\}\/sitemap\.xml`/);
});

test("global structured data uses stable entities without fabricated offer data", () => {
  const layout = read("src/app/layout.tsx");
  const homepage = read("src/app/page.tsx");
  assert.match(layout, /#organization/);
  assert.match(layout, /#website/);
  assert.doesNotMatch(layout, /SoftwareApplication|AggregateRating|priceCurrency|"@type": "Offer"/);
  assert.doesNotMatch(homepage, /buildWebSiteJsonLd/);
});

test("404 remains a useful server-rendered error instead of a client redirect", () => {
  const notFound = read("src/app/not-found.tsx");
  assert.doesNotMatch(notFound, /use client|router\.push|useEffect/);
  assert.match(notFound, /index: false/);
  assert.match(notFound, /404 · Page not found/);
  assert.match(notFound, /href="\/how-it-works"/);
});

test("all configured redirects remain in the single redirects hook", () => {
  const config = read("next.config.mjs");
  assert.equal((config.match(/async redirects\(\)/g) || []).length, 1);
  for (const route of [
    "/dashboard/documentation-preview",
    "/dashboard/documentation-templates",
    "/roles/associate/finance-insurance-partners",
    "/careers",
  ]) assert.ok(config.includes(route));
});
