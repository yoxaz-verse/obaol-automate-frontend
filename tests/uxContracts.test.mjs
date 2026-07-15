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

test("mobile app shell primitives are present", () => {
  const layout = read("../src/app/layout.tsx");
  const manifest = read("../src/app/manifest.ts");
  const globals = read("../src/app/globals.css");
  const dashboardLayout = read("../src/app/dashboard/layout.tsx");
  const bottomNav = read("../src/components/dashboard/BottomNav.tsx");
  const table = read("../src/components/CurdTable/common-table.tsx");

  assert.equal(layout.includes('manifest: "/manifest.webmanifest"'), true);
  assert.equal(layout.includes("appleWebApp"), true);
  assert.equal(manifest.includes('display: "standalone"'), true);
  assert.equal(manifest.includes('start_url: "/dashboard"'), true);
  assert.equal(globals.includes("--mobile-app-bottom-space"), true);
  assert.equal(globals.includes(".touch-target"), true);
  assert.equal(globals.includes("100dvh"), true);
  assert.equal(dashboardLayout.includes("h-[100dvh] max-h-[100dvh]"), true);
  assert.equal(dashboardLayout.includes("var(--mobile-app-bottom-space)"), true);
  assert.equal(bottomNav.includes("env(safe-area-inset-bottom)"), true);
  assert.equal(table.includes("sm:hidden"), true);
  assert.equal(table.includes("mobileActionColumns"), true);
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
  const homepage = read("../src/app/page.tsx");
  const globals = read("../src/app/globals.css");
  const showcase = read("../src/components/home/ServiceShowcase.tsx");
  const stagesBlock = hero.match(/const HERO_STAGES = \[[\s\S]*?\] as const satisfies readonly HeroStage\[\];/)?.[0] ?? "";
  const desktopBlock = hero.match(/const DESKTOP_COLLAGE_SLOTS[\s\S]*?\n\];/)?.[0] ?? "";
  const connectorBlock = hero.match(/const FLOW_CONNECTOR_PATHS = \[[\s\S]*?\] as const;/)?.[0] ?? "";
  const laptopBlock = hero.match(/<figure\s+data-hero-panel="unified-system"[\s\S]*?<\/figure>/)?.[0] ?? "";
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
  assert.equal(hero.includes('data-natural-scroll-hero="true"'), true);
  assert.equal(hero.includes('data-sticky-copy="true"'), true);
  assert.equal(hero.includes('lg:sticky lg:top-28'), true);
  assert.equal(hero.includes('data-hero-panel="execution-flow"'), true);
  assert.equal(hero.includes('data-hero-panel="unified-system"'), true);
  assert.equal(hero.includes('data-process-unifier="true"'), false);
  assert.equal(hero.includes("Every stage comes together on one OBAOL platform"), false);
  assert.equal(hero.includes('/images/order-execution-laptop.png'), true);
  assert.equal(hero.includes('/images/order-execution-tracking.png'), false);
  assert.equal(hero.includes("LaptopConvergencePaths"), false);
  assert.equal(hero.includes('data-convergence-overlay="true"'), false);
  assert.equal(hero.includes("data-convergence-path="), false);
  assert.equal(hero.includes('data-process-to-laptop-arrow="true"'), true);
  assert.equal(hero.includes("process-to-laptop-arrowhead"), true);
  assert.equal(hero.includes("All execution stages, tracked in one OBAOL workspace."), true);
  assert.equal(hero.includes("OBAOL laptop workspace showing all agro trade execution stages tracked in one platform."), true);
  assert.equal(laptopBlock.includes("whileInView"), false);
  assert.equal(laptopBlock.includes("viewport="), false);
  assert.equal(laptopBlock.includes("initial="), false);
  assert.equal(laptopBlock.includes("<motion.figure"), false);
  assert.equal(hero.includes("useScroll"), false);
  assert.equal(hero.includes("200svh"), false);
  assert.equal(hero.includes("smoothScrollProgress"), false);
  assert.equal(hero.includes('data-hero-scene='), false);
  assert.equal(hero.includes("whileInView={{ opacity: 1, y: 0, scale: 1 }}"), false);
  assert.equal(homepage.includes('className="obaol-home bg-background text-foreground"'), true);
  assert.equal(homepage.includes("overflow-hidden"), false);
  assert.equal(globals.includes("overflow-x: clip !important"), true);

  for (const imagePath of imagePaths) {
    const assetUrl = new URL(`../public${imagePath}`, import.meta.url);
    assert.equal(existsSync(fileURLToPath(assetUrl)), true, `${imagePath} should exist`);
  }
  assert.equal(existsSync(fileURLToPath(new URL("../public/images/order-execution-laptop.png", import.meta.url))), true);
});

test("the OBAOL perspective gateway presents a premium three-card entry point", () => {
  const perspective = read("../src/components/home/PerspectiveGateway.tsx");
  assert.equal(perspective.includes('aria-labelledby="obaol-perspective-heading"'), true);
  assert.equal(perspective.includes("Trade is more than buying and selling."), true);
  assert.equal(perspective.includes('href: "/why-obaol"'), true);
  assert.equal(perspective.includes('href: "/trust"'), true);
  assert.equal(perspective.includes('href: "/roles"'), true);
  assert.equal(perspective.includes("Market context"), true);
  assert.equal(perspective.includes("Verified execution"), true);
  assert.equal(perspective.includes("Role-based participation"), true);
  assert.equal(perspective.includes('data-perspective-card="true"'), true);
  assert.equal(perspective.includes('number: "01 / 03"'), true);
  assert.equal(perspective.includes('number: "02 / 03"'), true);
  assert.equal(perspective.includes('number: "03 / 03"'), true);
  assert.equal(perspective.includes("FiArrowRight"), true);
  assert.equal(perspective.includes("FiCompass"), true);
  assert.equal(perspective.includes("FiShield"), true);
  assert.equal(perspective.includes("FiUsers"), true);
  assert.equal(perspective.includes("bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)]"), true);
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
