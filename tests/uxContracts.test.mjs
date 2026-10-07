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
  const homepage = read("../src/components/home/HomeContent.tsx") + read("../src/components/home/HeroSectionServer.tsx");
  for (const phrase of ["CORE_LATENCY", "AES-256", "SYS_LINK"]) assert.equal(homepage.includes(phrase), false);
});

test("homepage hero presents the complete static ten-stage execution map", () => {
  const hero = read("../src/components/home/HeroSectionServer.tsx");
  const explorer = read("../src/components/home/HeroStageExplorer.tsx");
  const heroCta = read("../src/components/home/HeroCTA.tsx");
  const homeContent = read("../src/components/home/HomeContent.tsx");
  const homepage = read("../src/app/page.tsx");
  const globals = read("../src/app/globals.css");
  const stagesBlock = hero.match(/const HERO_STAGES = \[[\s\S]*?\] as const satisfies readonly HeroStage\[\];/)?.[0] ?? "";
  const imagePaths = [...stagesBlock.matchAll(/src: "(\/images\/[^"]+)"/g)].map((match) => match[1]);
  const stageLabels = [...stagesBlock.matchAll(/label: "([^"]+)"/g)].map((match) => match[1]);
  const stageMessages = [...stagesBlock.matchAll(/message: "([^"]+)"/g)].map((match) => match[1]);
  const stagePhases = [...stagesBlock.matchAll(/phase: "([^"]+)"/g)].map((match) => match[1]);

  assert.deepEqual(stageLabels, [
    "Discovery", "Sampling", "Coordination", "Documentation", "Inspection Visit",
    "Quality Testing", "Packaging", "Procurement", "Inland Transport", "Freight Forwarding",
  ]);
  assert.equal(stageMessages.length, 10);
  assert.deepEqual([...new Set(stagePhases)], ["Plan", "Verify", "Move", "Close"]);
  assert.equal(imagePaths.length, 10);
  assert.equal(new Set(imagePaths).size, 10);
  assert.equal(imagePaths.filter((path) => path.startsWith("/images/execution-flow/")).length, 9);
  assert.equal(imagePaths.filter((path) => path.startsWith("/images/hero-operations/")).join(""), "/images/hero-operations/freight.webp");
  assert.equal(hero.includes('"use client"'), false);
  assert.equal(homeContent.includes('from "@/components/home/HeroSectionServer"'), true);
  assert.equal(explorer.includes('data-hero-panel="execution-map"'), true);
  assert.equal(explorer.includes("data-execution-stage={stage.id}"), true);
  assert.equal(explorer.includes('data-execution-stage-band="true"'), true);
  assert.equal(explorer.includes("data-execution-phase={phase.phase.toLowerCase()}"), true);
  assert.equal(explorer.includes("data-execution-stage-group={phase.phase.toLowerCase()}"), true);
  assert.equal(explorer.includes('/images/hero-agro-execution-v2.webp'), true);
  assert.equal(explorer.includes('/images/hero-operations/port-operations-stock.webp'), false);
  assert.equal(explorer.includes('data-hero-lifecycle-visual="true"'), true);
  assert.equal(explorer.includes('data-hero-ink-fade="true"'), true);
  assert.equal(explorer.includes('data-execution-route="phase-rail"'), true);
  assert.equal(explorer.includes('data-execution-route="stepped"'), false);
  assert.equal(explorer.includes("stages.filter("), true);
  assert.equal(explorer.includes("Indian agro-trade lifecycle from crop sourcing and documentation through quality verification, packaging, warehousing, and delivery"), true);
  assert.equal(explorer.includes("animate-ping"), false);
  assert.equal(explorer.includes("group-hover:scale"), false);
  assert.equal(explorer.includes("<svg"), false);
  assert.equal(explorer.includes("xl:w-[calc"), false);
  assert.equal(explorer.includes('aria-label="All ten execution stages grouped by phase"'), true);
  assert.equal(explorer.includes('role="tablist"'), false);
  assert.equal(explorer.includes("setActiveIndex"), false);
  assert.equal(explorer.includes("setInterval"), false);
  assert.equal(explorer.includes("setTimeout"), false);
  assert.equal(heroCta.match(/<Link/g)?.length, 1);
  assert.equal(heroCta.includes("Start Buying"), false);
  assert.equal(heroCta.includes("Start Selling"), false);
  assert.equal(heroCta.includes("Work in Operations"), false);
  assert.equal(hero.includes("animate-ping"), false);
  assert.equal(hero.includes('data-natural-scroll-hero="true"'), true);
  assert.equal(hero.includes('lg:sticky lg:top-28'), false);
  assert.equal(homepage.includes('className="obaol-home bg-background text-foreground"'), true);
  assert.equal(homepage.includes("overflow-hidden"), false);
  assert.equal(globals.includes("overflow-x: clip !important"), true);

  for (const imagePath of imagePaths) {
    const assetUrl = new URL(`../public${imagePath}`, import.meta.url);
    assert.equal(existsSync(fileURLToPath(assetUrl)), true, `${imagePath} should exist`);
  }
  assert.equal(existsSync(fileURLToPath(new URL("../public/images/order-execution-laptop.webp", import.meta.url))), true);
  assert.equal(existsSync(fileURLToPath(new URL("../public/images/hero-agro-execution-v2.webp", import.meta.url))), true);
});

test("homepage services use an eight-chapter scroll story without autoplay", () => {
  const services = read("../src/components/home/ServiceShowcase.tsx");
  const homeContent = read("../src/components/home/HomeContent.tsx");
  const chapterIds = [...services.matchAll(/\{ id: "([^"]+)", title:/g)].map((match) => match[1]);
  const imagePaths = [...services.matchAll(/image: "([^"]+-trade-v2\.webp)"/g)].map((match) => match[1]);
  const imageAlts = [...services.matchAll(/imageAlt: "([^"]+)"/g)].map((match) => match[1]);

  assert.deepEqual(chapterIds, [
    "sourcing", "documentation", "procurement", "quality",
    "packaging", "logistics", "warehouse", "freight",
  ]);
  assert.equal(services.includes('data-service-story="true"'), true);
  assert.equal(services.includes("data-service-chapter={service.id}"), true);
  assert.equal(services.includes("data-active-service={active.id}"), true);
  assert.equal(services.includes("sticky top-28"), true);
  assert.equal(services.includes("IntersectionObserver"), true);
  assert.equal(services.includes("requestAnimationFrame"), true);
  assert.equal(services.includes("window.innerHeight * 0.45"), true);
  assert.equal(services.includes("lg:min-h-[72svh]"), true);
  assert.equal(services.includes("duration-200"), true);
  assert.equal(services.includes("AnimatePresence"), false);
  assert.equal(services.includes('mode="wait"'), false);
  assert.equal(services.includes("onActivate"), false);
  assert.equal(services.includes("setInterval"), false);
  assert.equal(services.includes("images.pexels.com"), false);
  assert.equal(imagePaths.length, 8);
  assert.equal(new Set(imagePaths).size, 8);
  assert.equal(imagePaths.every((imagePath) => imagePath.startsWith("/images/services/")), true);
  assert.equal(imageAlts.length, 8);
  assert.equal(imageAlts.every((alt) => alt.length >= 60), true);
  for (const imagePath of imagePaths) {
    const assetUrl = new URL(`../public${imagePath}`, import.meta.url);
    assert.equal(existsSync(fileURLToPath(assetUrl)), true, `${imagePath} should exist`);
  }
  assert.equal(homeContent.indexOf("<DeferredServiceShowcase />") < homeContent.indexOf('<section id="capability-explorer"'), true);
  assert.equal(homeContent.indexOf('<section id="capability-explorer"') < homeContent.indexOf("<PerspectiveGateway />"), true);
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

test("footer careers link redirects to the OBAOL hiring portal", () => {
  const footer = read("../src/components/home/footer.tsx");
  const nextConfig = read("../next.config.mjs");
  assert.equal(footer.includes('{ name: "Careers", href: "/careers" }'), true);
  assert.equal(nextConfig.includes('source: "/careers"'), true);
  assert.equal(nextConfig.includes('destination: "https://hiring.obaol.com/careers"'), true);
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

test("variant rate wizard uses searchable, dependent commodity controls", () => {
  const wizard = read("../src/components/dashboard/Catalog/VariantRateWizardModal.tsx");
  assert.equal(wizard.includes("AutocompleteItem"), true);
  assert.equal(wizard.includes("renderCommodityAutocomplete"), true);
  assert.equal(wizard.includes('field: "category"'), true);
  assert.equal(wizard.includes('field: "subCategory"'), true);
  assert.equal(wizard.includes('field: "product"'), true);
  assert.equal(wizard.includes('field: "productVariant"'), true);
  assert.equal(wizard.includes("allowsCustomValue={false}"), true);
  assert.equal(wizard.includes("setCommodityInput({})"), true);
  assert.equal(wizard.includes("let isMounted = true"), true);
  assert.equal(wizard.includes("Select subcategory first"), true);
});

test("catalog grid cards respond to their container without compressing controls", () => {
  const variantRate = read("../src/components/dashboard/Catalog/variant-rate.tsx");
  const globals = read("../src/app/globals.css");

  assert.equal(variantRate.includes('viewMode === "grid"\n                          ? "catalog-responsive-grid"'), true);
  assert.equal(variantRate.includes("catalog-card-compact-actions"), true);
  assert.equal(variantRate.includes("More options for"), true);
  assert.equal(globals.includes("repeat(auto-fill, minmax(min(100%, 13.5rem), 1fr))"), true);
  assert.equal(globals.includes("@container catalog-card (max-width: 15rem)"), true);
  assert.equal(globals.includes(".catalog-card-standard-actions"), true);
});
