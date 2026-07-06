import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

test("the root viewport allows browser zoom", () => {
  const layout = read("../src/app/layout.tsx");
  assert.equal(layout.includes("userScalable: false"), false);
  assert.equal(layout.includes("maximumScale: 1"), false);
  assert.equal(layout.includes("Skip to main content"), true);
});

test("the public entry clearly separates Associate and Operator accounts", () => {
  const entry = read("../src/components/Auth/AuthEntry.tsx");
  for (const phrase of [
    "I represent an industry business",
    "I want to become an OBAOL Operator",
    "Registered company required",
    "not an internal operations or employee login",
  ]) assert.equal(entry.includes(phrase), true);
  for (const phrase of ["I want to buy", "I want to sell", "I work in operations"]) assert.equal(entry.includes(phrase), false);
});

test("active homepage source does not advertise fabricated runtime telemetry", () => {
  const homepage = read("../src/components/home/HomeContent.tsx") + read("../src/components/home/herosection.tsx");
  for (const phrase of ["CORE_LATENCY", "AES-256", "SYS_LINK"]) assert.equal(homepage.includes(phrase), false);
});

test("homepage hero presents the ordered ten-stage execution flow", () => {
  const hero = read("../src/components/home/herosection.tsx");
  const showcase = read("../src/components/home/ServiceShowcase.tsx");
  const stagesBlock = hero.match(/const HERO_STAGES = \[[\s\S]*?\] as const satisfies readonly HeroStage\[\];/)?.[0] ?? "";
  const desktopBlock = hero.match(/const DESKTOP_COLLAGE_SLOTS[\s\S]*?\n\];/)?.[0] ?? "";
  const connectorBlock = hero.match(/const FLOW_CONNECTOR_PATHS = \[[\s\S]*?\] as const;/)?.[0] ?? "";
  const imagePaths = [...stagesBlock.matchAll(/src: "(\/images\/[^"]+)"/g)].map((match) => match[1]);
  const stageLabels = [...stagesBlock.matchAll(/\n\s+label: "([^"]+)"/g)].map((match) => match[1]);
  const stageSequences = [...stagesBlock.matchAll(/\n\s+sequence: (\d+)/g)].map((match) => Number(match[1]));
  const desktopStageIds = [...desktopBlock.matchAll(/stageId: "([^"]+)"/g)].map((match) => match[1]);
  const connectorPairs = [...connectorBlock.matchAll(/from: "([^"]+)", to: "([^"]+)"/g)].map((match) => [match[1], match[2]]);
  const showcaseLocalPaths = [...showcase.matchAll(/(?:image|src):\s*"(\/images\/[^"]+)"/g)].map((match) => match[1]);

  assert.deepEqual(stageLabels, [
    "Discovery", "Sampling", "Coordination", "Documentation", "Inspection Visit",
    "Quality Testing", "Packaging", "Procurement", "Inland Transportation", "Freight Forwarding",
  ]);
  assert.deepEqual(stageSequences, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.deepEqual(desktopStageIds, [
    "discovery", "sampling", "coordination", "documentation", "inspection-visit",
    "quality-testing", "packaging", "procurement", "inland-transportation", "freight-forwarding",
  ]);
  assert.equal(imagePaths.length, 10);
  assert.equal(new Set(imagePaths).size, 10);
  assert.equal(imagePaths.filter((path) => path.startsWith("/images/execution-flow/")).length, 9);
  assert.equal(imagePaths.filter((path) => path.startsWith("/images/hero-operations/")).join(""), "/images/hero-operations/freight.webp");
  assert.equal(imagePaths.some((path) => showcaseLocalPaths.includes(path)), false);
  assert.equal(hero.includes("HERO_STAGES.map((stage)"), true);
  assert.equal(hero.includes('role="region"'), true);
  assert.equal(hero.includes("snap-mandatory"), true);
  assert.equal(hero.includes("MOBILE_COLLAGE_SLOTS"), false);
  assert.equal(hero.includes("COLLAGE_SWAP_DELAYS"), false);
  assert.equal(hero.includes("DESKTOP_ROTATING_STAGE_ORDER"), false);
  assert.equal(hero.includes("new window.Image()"), false);
  assert.equal(hero.includes("prefersReducedMotion"), true);
  assert.deepEqual(connectorPairs, [
    ["discovery", "sampling"],
    ["sampling", "coordination"],
    ["coordination", "documentation"],
    ["documentation", "inspection-visit"],
    ["inspection-visit", "quality-testing"],
    ["quality-testing", "packaging"],
    ["packaging", "procurement"],
    ["procurement", "inland-transportation"],
    ["inland-transportation", "freight-forwarding"],
  ]);
  assert.equal(hero.includes('data-flow-connector="desktop"'), true);
  assert.equal(hero.includes('data-flow-connector="mobile"'), true);
  assert.equal(hero.includes("index < HERO_STAGES.length - 1"), true);
  assert.equal(hero.includes("pointer-events-none absolute inset-0 z-[1]"), true);
  assert.equal(hero.includes('markerEnd="url(#flow-arrowhead)"'), true);

  for (const imagePath of imagePaths) {
    const assetUrl = new URL(`../public${imagePath}`, import.meta.url);
    assert.equal(existsSync(fileURLToPath(assetUrl)), true, `${imagePath} should exist`);
  }
});

test("the public commodity experience uses concise Catalog naming", () => {
  const header = read("../src/components/home/header.tsx");
  const footer = read("../src/components/home/footer.tsx");
  const directory = read("../src/app/product/page.tsx");
  const middleware = read("../src/middleware.ts");
  assert.equal(header.includes('label: "Catalog"'), true);
  assert.equal(footer.includes('name: "Catalog"'), true);
  assert.equal(directory.includes("Commodity"), true);
  assert.equal(directory.includes(">Catalog<"), true);
  assert.equal(directory.includes('placeholder="Search commodities"'), true);
  assert.equal(directory.includes("No commodities available"), true);
  assert.equal(directory.includes("OBAOL does not own or sell these commodities"), true);
  assert.equal(directory.includes("/api/trade-directory"), true);
  assert.equal(middleware.includes("/trade-directory${suffix}"), true);
  for (const phrase of ["Associate Trade Directory", "Associate-traded", "Associate coverage"]) {
    assert.equal((header + footer + directory).includes(phrase), false);
  }
});

test("dashboard discovery uses Trade Listings terminology", () => {
  const access = read("../src/utils/dashboardAccess.ts");
  const discovery = read("../src/app/dashboard/marketplace/page.tsx");
  assert.equal(access.includes('label: "Trade Listings"'), true);
  assert.equal(access.includes('label: "My Trade Listings"'), true);
  assert.equal(access.includes('label: "Commodity Directory"'), true);
  assert.equal(discovery.includes("Trade Listing Discovery"), true);
  assert.equal(discovery.includes('aria-label="Trade listing status"'), true);
});
