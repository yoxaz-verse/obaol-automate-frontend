import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const sources = [
  "src/app/about/page.tsx",
  "src/app/about/about.content.1.mdx",
  "src/components/home/tradeoperatinglayer.tsx",
  "src/components/home/aboutsection.tsx",
  "src/components/home/startedin.tsx",
  "src/components/about/AboutExecutionFramework.tsx",
].map(read).join("\n");

test("About page has one mission-led H1 and role CTA", () => {
  assert.equal((sources.match(/<h1\b|<motion\.h1\b/g) || []).length, 1);
  assert.match(sources, /Built to Make/);
  assert.match(sources, /Bulk Trade Execution/);
  assert.match(sources, /More Accountable/);
  assert.match(sources, /Find the OBAOL Role That Matches Your Business/);
  assert.match(read("src/app/about/page.tsx"), /href="\/roles"/);
});

test("About page describes current audiences and execution workflow", () => {
  for (const phrase of [
    "Buyers, Importers & Procurement Companies",
    "Suppliers, Exporters & Traders",
    "Packaging, Quality, Warehouse & Logistics Companies",
    "Freight Forwarders & Customs Agencies",
    "Finance, Insurance & Technology Partners",
    "Operators for Registered Organizations",
    "Define Requirement or Supply",
    "Track Delivery & Closure",
    "Responsibilities Stay",
  ]) assert.ok(sources.includes(phrase), `missing About content: ${phrase}`);
});

test("About page does not restore unsupported or outdated claims", () => {
  for (const phrase of [
    "Start without capital",
    "without upfront investment",
    "without upfront capital",
    "90% of commodity deals fail",
    "OBAOL is not a marketplace",
    "pre-verified suppliers",
    "consistent business",
    "recurring service revenue",
    "professionals with no capital",
    "informilising",
  ]) assert.doesNotMatch(sources, new RegExp(phrase, "i"));
});

test("About metadata owns accurate B2B bulk-trade intent", () => {
  const page = read("src/app/about/page.tsx");
  assert.match(page, /About OBAOL Supreme \| B2B Bulk Trade Execution/);
  assert.match(page, /commodity workflow coordination/);
  assert.match(page, /buyer supplier collaboration/);
  assert.match(page, /India commodity trade platform/);
});
