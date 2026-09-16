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
  const login = read("../src/components/Login/login-component.tsx");
  for (const phrase of [
    "For companies and trade businesses",
    "For OBAOL-approved execution specialists",
    "Choose your account",
    'href: "/auth/register"',
    'href: "/auth/operator/register"',
    'signInHref: "/auth/associate"',
    'signInHref: "/auth/operator"',
    "Register as {option.role}",
    "Sign in as {option.role}",
    "Commodity discovery",
    "Verified partners",
    "Execution workflows",
    "Documents and orders",
  ]) assert.equal(entry.includes(phrase), true);
  for (const phrase of [
    "Registering a company?",
    "For independent people coordinating trades, not company registration.",
  ]) assert.equal(login.includes(phrase), true);
  for (const phrase of ["I want to buy", "I want to sell", "I work in operations", "Internal Ops"]) {
    assert.equal(entry.includes(phrase), false);
    assert.equal(login.includes(phrase), false);
  }
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
  const desktopSlots = hero.match(/const DESKTOP_COLLAGE_SLOTS = \[[\s\S]*?\] as const;/)?.[0] ?? "";
  const connectorPaths = hero.match(/const FLOW_CONNECTOR_PATHS = \[[\s\S]*?\] as const;/)?.[0] ?? "";
  const laptopBlock = read("../src/components/home/ExecutionPreview.tsx");
  const imagePaths = [...stagesBlock.matchAll(/src: "(\/images\/[^"]+)"/g)].map((match) => match[1]);
  const stageLabels = [...stagesBlock.matchAll(/\n\s+label: "([^"]+)"/g)].map((match) => match[1]);
  const stageSequences = [...stagesBlock.matchAll(/\n\s+sequence: (\d+)/g)].map((match) => Number(match[1]));
  const stageMessages = [...stagesBlock.matchAll(/\n\s+message: "([^"]+)"/g)].map((match) => match[1]);
  const showcaseLocalPaths = [...showcase.matchAll(/(?:image|src):\s*"(\/images\/[^"]+)"/g)].map((match) => match[1]);

  assert.deepEqual(stageLabels, [
    "Discovery", "Sampling", "Coordination", "Documentation", "Inspection Visit",
    "Quality Testing", "Packaging", "Procurement", "Inland Transportation", "Freight Forwarding",
  ]);
  assert.deepEqual(stageSequences, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(stageMessages.length, 10);
  assert.equal(imagePaths.length, 10);
  assert.equal(new Set(imagePaths).size, 10);
  assert.equal(imagePaths.filter((path) => path.startsWith("/images/execution-flow/")).length, 9);
  assert.equal(imagePaths.filter((path) => path.startsWith("/images/hero-operations/")).join(""), "/images/hero-operations/freight.webp");
  assert.equal(imagePaths.some((path) => showcaseLocalPaths.includes(path)), false);
  assert.equal(hero.includes("HERO_STAGES.map((stage, index)"), true);
  assert.equal(hero.includes("const activeStage = HERO_STAGES[activeStageIndex]"), true);
  assert.equal([...desktopSlots.matchAll(/left: \d+(?:\.\d+)?, top:/g)].length, 10);
  assert.equal([...connectorPaths.matchAll(/"M /g)].length, 9);
  assert.equal(hero.includes("{active ? ("), true);
  assert.equal(hero.includes("active={index === activeStageIndex}"), true);
  assert.equal(hero.includes("{activeStage.message}"), true);
  assert.equal(hero.includes("HERO_ROTATION_INTERVAL = 1800"), true);
  assert.equal(hero.includes("(current + 1) % HERO_STAGES.length"), true);
  assert.equal(hero.includes("shouldReduceMotion || isStageControlActive"), true);
  assert.equal(hero.includes("onSelect={() => setActiveStageIndex(index)}"), true);
  assert.equal(hero.includes('aria-current={active ? "step" : undefined}'), true);
  assert.equal(hero.includes("Step {stage.sequence}"), true);
  assert.equal(hero.includes("MOBILE_COLLAGE_SLOTS"), false);
  assert.equal(hero.includes("COLLAGE_SWAP_DELAYS"), false);
  assert.equal(hero.includes("DESKTOP_ROTATING_STAGE_ORDER"), false);
  assert.equal(hero.includes("new window.Image()"), false);
  assert.equal(hero.includes("prefersReducedMotion"), true);
  assert.equal(hero.includes("FLOW_CONNECTOR_PATHS.map"), true);
  assert.equal(hero.includes("grid-cols-2 gap-4"), true);
  assert.equal(hero.includes('data-natural-scroll-hero="true"'), true);
  assert.equal(hero.includes('data-sticky-copy="true"'), true);
  assert.equal(hero.includes('lg:sticky lg:top-28'), true);
  assert.equal(hero.includes('data-hero-panel="execution-flow"'), true);
  assert.equal(laptopBlock.includes('data-hero-panel="unified-system"'), true);
  assert.equal(hero.includes('data-process-unifier="true"'), false);
  assert.equal(hero.includes("Every stage comes together on one OBAOL platform"), false);
  assert.equal(hero.includes('/images/order-execution-laptop.png'), false);
  assert.equal(hero.includes('/images/order-execution-tracking.png'), false);
  assert.equal(hero.includes("LaptopConvergencePaths"), false);
  assert.equal(hero.includes('data-convergence-overlay="true"'), false);
  assert.equal(hero.includes("data-convergence-path="), false);
  assert.equal(hero.includes('data-process-to-laptop-arrow="true"'), false);
  assert.equal(hero.includes("process-to-laptop-arrowhead"), false);
  assert.equal(laptopBlock.includes("All execution stages, tracked in one OBAOL workspace."), true);
  assert.equal(hero.includes("OBAOL laptop workspace showing all agro trade execution stages tracked in one platform."), false);
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
  assert.equal(perspective.includes("bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)]"), false);
});

test("retired public commodity sections are absent from navigation and redirect home", () => {
  const header = read("../src/components/home/header.tsx");
  const footer = read("../src/components/home/footer.tsx");
  const directory = read("../src/app/product/page.tsx");
  const middleware = read("../src/middleware.ts");
  const navigation = read("../src/data/publicNavigation.ts");
  for (const route of ["/trade-directory", "/product", "/companies", "/obaol"]) {
    assert.equal(navigation.includes(`href: "${route}"`), false);
    assert.equal(middleware.includes(`"${route}"`), true);
  }
  assert.equal(footer.includes('name: "Catalog"'), false);
  assert.equal(directory.includes("Commodity"), true);
  assert.equal(directory.includes(">Catalog<"), true);
  assert.equal(directory.includes('placeholder="Search commodities"'), true);
  assert.equal(directory.includes("No commodities available"), true);
  assert.equal(directory.includes("OBAOL does not own or sell these commodities"), true);
  assert.equal(directory.includes("/api/trade-directory"), true);
  assert.equal(middleware.includes('target.pathname = "/"'), true);
  assert.equal(middleware.includes('hostResolution.kind === "platform"'), true);
  assert.equal(read("../src/app/sitemap.ts").includes('url: `${baseUrl}/trade-directory'), false);
  assert.equal(read("../src/app/sitemap.ts").includes('url: `${baseUrl}/obaol'), false);
  assert.equal(read("../src/app/robots.ts").includes('"/trade-directory"'), false);
  assert.equal(read("../src/utils/seo.ts").includes('"@type": "SearchAction"'), false);
  assert.equal(read("../src/app/layout.tsx").includes('"@type": "SearchAction"'), false);
  for (const phrase of ["Associate Trade Directory", "Associate-traded", "Associate coverage"]) {
    assert.equal((header + footer + directory).includes(phrase), false);
  }
});

test("Methods uses the shared public header with separate heading styles", () => {
  const page = read("../src/app/methods/page.tsx");
  const css = read("../src/app/methods/methods.css");
  assert.equal(page.includes("<Header />"), true);
  assert.equal(page.includes('className="methods-heading"'), true);
  assert.equal(css.includes(".methods-heading"), true);
  assert.equal(css.includes("padding: calc(8rem + var(--safe-top, 0px))"), true);
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

test("variant rate wizard Commodity Directory CTA opens Commodity Directory", () => {
  const wizard = read("../src/components/dashboard/Catalog/VariantRateWizardModal.tsx");
  assert.equal(wizard.includes("Go to Commodity Directory"), true);
  assert.equal(wizard.includes("Go to Global Catalog"), false);
  assert.equal(wizard.includes('router.push("/dashboard/catalog")'), true);
  assert.equal(wizard.includes('onClick={() => router.push("/dashboard/product")}'), false);
});
