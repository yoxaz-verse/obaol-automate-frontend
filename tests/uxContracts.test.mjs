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
  assert.equal(bottomNav.includes("var(--safe-bottom)"), true);
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
    'data-testid="persistent-signup-cta"',
    'data-testid="account-not-found-signup-cta"',
    "Create {roleKey === \"associate\" ? \"Associate\" : \"Operator\"} Account",
  ]) assert.equal(login.includes(phrase), true);
  for (const phrase of ["I want to buy", "I want to sell", "I work in operations", "Internal Ops"]) {
    assert.equal(entry.includes(phrase), false);
    assert.equal(login.includes(phrase), false);
  }
});

test("passkey sign-in is rendered only after WebAuthn support is confirmed", () => {
  const login = read("../src/components/Login/login-component.tsx");
  assert.match(login, /passkeySupport === "supported" && \(\s*<Button[\s\S]*?data-testid="passkey-signin"/);
  assert.doesNotMatch(login, /isDisabled=\{passkeySupport !== "supported"/);
  assert.match(login, /startAuthentication\(\{ optionsJSON: optionsResponse\.data\.options \}\)/);
});

test("subcategory deletion is exposed only to admins", () => {
  const categoryDivision = read("../src/components/dashboard/Catalog/category-division.tsx");
  assert.match(categoryDivision, /String\(user\?\.role \|\| ""\)\.toLowerCase\(\) === "admin" && \([\s\S]*?<UserDeleteModal/);
});

test("active homepage source does not advertise fabricated runtime telemetry", () => {
  const homepage = read("../src/components/home/HomeContent.tsx") + read("../src/components/home/HeroSectionServer.tsx");
  for (const phrase of ["CORE_LATENCY", "AES-256", "SYS_LINK"]) assert.equal(homepage.includes(phrase), false);
});

test("homepage communicates open registration without weakening verification", () => {
  const hero = read("../src/components/home/HeroSectionServer.tsx");
  const heroCta = read("../src/components/home/HeroCTA.tsx");
  const header = read("../src/components/home/header.tsx");
  const homepage = read("../src/app/page.tsx");

  for (const phrase of [
    "Open Agro Execution Platform",
    "Open registration—buyers, suppliers, and specialist service partners can join without an invitation.",
    "Participant and company verification still applies to keep execution trusted.",
  ]) assert.equal(hero.includes(phrase), true);
  assert.equal(heroCta.includes('isAuthenticated ? "Open Workspace" : "Join the Open Platform"'), true);
  assert.equal(heroCta.includes('const href = !loading && isAuthenticated ? "/dashboard" : "/auth"'), true);
  assert.equal(header.includes('signedIn ? "Open workspace" : "Join Platform"'), true);
  assert.equal(header.includes('href={signedIn ? "/dashboard" : "/auth"}'), true);
  assert.equal(homepage.includes("open-registration B2B agro execution platform"), true);
  assert.equal(homepage.includes("An open-registration platform"), true);
});

test("homepage hero presents the complete static ten-stage execution map", () => {
  const hero = read("../src/components/home/HeroSectionServer.tsx");
  const explorer = read("../src/components/home/HeroStageExplorer.tsx");
  const heroCta = read("../src/components/home/HeroCTA.tsx");
  const homeContent = read("../src/components/home/HomeContent.tsx");
  const homepage = read("../src/app/page.tsx");
  const globals = read("../src/app/globals.css");
  const inkMaskStyle = read("../src/components/home/inkArtworkMask.ts");
  const inkMaskAsset = read("../public/images/masks/ink-wash-edge.svg");
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
  assert.equal(explorer.includes('className="hidden border-y border-default-200/70 bg-default-50/55 py-7 dark:bg-default-50/[0.025] md:block lg:py-8"'), true);
  assert.equal(explorer.includes('data-hero-assistant-safe-zone="true"'), true);
  assert.equal(explorer.includes('data-execution-stage-band="true" aria-labelledby="execution-stage-band-title" className="mt-'), false);
  assert.equal(explorer.includes("data-execution-phase={phase.phase.toLowerCase()}"), true);
  assert.equal(explorer.includes("data-execution-stage-group={phase.phase.toLowerCase()}"), true);
  assert.equal(explorer.includes('/images/hero-agro-execution-art-v2.webp'), true);
  assert.equal(explorer.includes('/images/hero-operations/port-operations-stock.webp'), false);
  assert.equal(explorer.includes('data-hero-lifecycle-visual="true"'), true);
  assert.equal(explorer.includes('data-hero-lifecycle-heading="true"'), true);
  assert.equal(explorer.includes('data-hero-masked-image="true"'), true);
  assert.equal(explorer.includes('data-hero-ink-fade="true"'), true);
  assert.equal(explorer.includes('data-ink-artwork-mask="true"'), true);
  assert.equal(explorer.includes("inkArtworkMaskStyle"), true);
  assert.equal(inkMaskStyle.includes("maskImage: inkMask"), true);
  assert.equal(inkMaskStyle.includes("WebkitMaskImage: inkMask"), true);
  assert.equal(inkMaskStyle.includes("spaciousInkArtworkMaskStyle"), true);
  assert.equal(inkMaskAsset.includes('filter id="ink-edge"'), true);
  assert.equal(inkMaskAsset.includes("feTurbulence"), true);
  assert.equal(inkMaskAsset.includes('style="background:transparent"'), true);
  assert.equal(inkMaskAsset.includes("<circle"), false);
  assert.equal(explorer.includes("From origin to delivery"), true);
  assert.equal(explorer.includes("One connected agro execution system"), false);
  assert.equal(explorer.includes('data-execution-route="phase-rail"'), true);
  assert.equal(explorer.includes('data-execution-route="stepped"'), false);
  assert.equal(explorer.includes("stages.filter("), true);
  assert.equal(explorer.includes('data-execution-stage-grid="true"'), true);
  assert.equal(explorer.includes("grid-cols-1"), true);
  assert.equal(explorer.includes("md:grid-cols-2"), true);
  assert.equal(explorer.includes("xl:grid-cols-[3fr_3fr_3fr_1.2fr]"), true);
  assert.equal(explorer.includes("Expressive ink-and-watercolor artwork of the Indian agro-trade lifecycle from crop sourcing and documentation through quality verification, packaging, warehousing, and delivery"), true);
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
  assert.equal(hero.indexOf("</section>") < hero.indexOf("<HeroStageBand stages={HERO_STAGES} />"), true);
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
  assert.equal(existsSync(fileURLToPath(new URL("../public/images/hero-agro-execution-art-v2.webp", import.meta.url))), true);
});

test("homepage services use a compact nine-piece interactive puzzle", () => {
  const services = read("../src/components/home/ServiceShowcase.tsx");
  const homeContent = read("../src/components/home/HomeContent.tsx");
  const hero = read("../src/components/home/HeroSectionServer.tsx");
  const homepage = read("../src/app/page.tsx");
  const chapterIds = [...services.matchAll(/\{ id: "([^"]+)", title:/g)].map((match) => match[1]);
  const imagePaths = [...services.matchAll(/image: "([^"]+\.webp)"/g)].map((match) => match[1]);
  const imageAlts = [...services.matchAll(/imageAlt: "([^"]+)"/g)].map((match) => match[1]);

  assert.deepEqual(chapterIds, [
    "discovery", "sourcing", "documentation", "procurement", "quality",
    "packaging", "logistics", "warehouse", "freight",
  ]);
  assert.equal(services.includes('data-service-puzzle="true"'), true);
  assert.equal(services.includes('data-service-puzzle-grid="true"'), true);
  assert.equal(services.includes("data-puzzle-assembled={puzzleAssembled"), true);
  assert.equal(services.includes("data-service-piece={service.id}"), true);
  assert.equal(services.includes('data-service-selected={isSelected ? "true" : "false"}'), true);
  assert.equal(services.includes('data-service-partial-image={isSelected ? "false" : "true"}'), true);
  assert.equal(services.includes("aria-pressed={isSelected}"), true);
  assert.equal(services.includes('aria-live="polite"'), true);
  assert.equal(services.includes('aria-controls="service-puzzle-details"'), true);
  assert.equal(services.includes("useInView"), true);
  assert.equal(services.includes("once: true"), true);
  assert.equal(services.includes("layout={!adaptiveMotion.prefersReducedMotion}"), true);
  assert.equal(services.includes("grid-cols-2"), true);
  assert.equal(services.includes("lg:grid-cols-12"), true);
  assert.equal(services.includes("lg:col-span-7 lg:row-span-4"), true);
  assert.equal(services.includes("fragmentLayouts"), true);
  assert.equal(services.includes("fragmentPositions"), true);
  assert.equal(services.includes('data-service-story="true"'), false);
  assert.equal(services.includes("sticky top-28"), false);
  assert.equal(services.includes("lg:min-h-[72svh]"), false);
  assert.equal(services.includes("IntersectionObserver"), false);
  assert.equal(services.includes("Every trade begins as a possibility"), false);
  assert.equal(services.includes("images.pexels.com"), false);
  assert.equal(imagePaths.length, 9);
  assert.equal(new Set(imagePaths).size, 9);
  assert.equal(imagePaths.filter((imagePath) => imagePath.startsWith("/images/services/")).length, 8);
  assert.equal(imagePaths[0], "/images/execution-flow/01-discovery-art-v2.webp");
  assert.equal(imageAlts.length, 9);
  assert.equal(imageAlts.every((alt) => alt.length >= 60), true);
  for (const phrase of [
    "Buyer and supplier matching", "Sourcing partners", "Documentation specialists",
    "Procurement partners", "Independent labs", "Packaging providers", "Transport partners",
    "Warehouse operators", "Freight forwarders",
  ]) assert.equal(services.includes(phrase), true);
  assert.equal(services.includes("Different specialists. One connected trade."), true);
  assert.equal(services.includes("OBAOL connects the work without replacing the people performing it."), true);
  assert.equal(hero.includes("Open registration—buyers, suppliers, and specialist service partners can join without an invitation."), true);
  assert.equal(homeContent.includes("OBAOL is the technology and coordination platform"), true);
  assert.equal(homeContent.includes("Independent trade participants do the specialist work."), true);
  assert.equal(homepage.includes("open-registration B2B agro execution platform"), true);
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
  assert.equal(discovery.includes('title="Today’s Live"'), true);
});

test("marketplace rates are revealed explicitly and past enquiries warn buyers", () => {
  const rates = read("../src/components/dashboard/Catalog/variant-rate.tsx");
  const access = read("../src/utils/dashboardAccess.ts");
  assert.equal(rates.includes("Reveal Rate"), true);
  assert.equal(rates.includes("Previous listed price"), true);
  assert.equal(rates.includes("This is an older listing"), true);
  assert.equal(rates.includes("Price and stock require confirmation"), true);
  assert.equal(rates.includes('className="flex-col-reverse sm:flex-row sm:justify-end"'), true);
  assert.equal(rates.includes("Continue with Enquiry"), true);
  assert.equal(rates.includes("The seller has been asked to confirm the latest price and product availability."), true);
  assert.equal(access.includes('path: "/dashboard/rate-interest"'), true);
});

test("marketplace enquiry is available for foreign listings while owners manage their own", () => {
  const rates = read("../src/components/dashboard/Catalog/variant-rate.tsx");
  assert.equal(rates.includes("item.isMarketplaceView &&\n                          !item.isOwnedByViewer &&\n                          (isAssociateUser || isAdminUser)"), true);
  assert.equal(rates.includes("Manage listing"), true);
  assert.equal(rates.includes("isAssociateUser && !item?.isOwnedByViewer"), true);
  assert.equal(rates.includes('{variantRate?.isLive ? "Enquire" : "Check Current Price"}'), true);
  assert.equal(rates.includes("canCreateMarketplaceEnquiry ? (\n                                    <CreateEnquiryButton"), true);
  assert.equal(rates.includes("variantRate={item}\n                                      compact"), true);
});

test("trade listings refresh active views and exclude owned live marketplace rows", () => {
  const marketplace = read("../src/app/dashboard/marketplace/page.tsx");
  const product = read("../src/app/dashboard/product/page.tsx");
  const query = read("../src/components/queryComponent.tsx");
  const rates = read("../src/components/dashboard/Catalog/variant-rate.tsx");
  assert.equal(marketplace.includes("isLive: true, excludeOwned: true"), true);
  assert.equal(marketplace.includes('isActive={currentTable === "marketplace-live"}'), true);
  assert.equal(product.includes('isActive={currentTable === "mine"}'), true);
  assert.equal(query.includes("refetchIntervalInBackground: false"), true);
  assert.equal(query.includes('refetchOnWindowFocus: refreshEnabled ? "always" : false'), true);
  assert.equal(rates.includes("invalidateListingQueries(queryClient)"), true);
  assert.equal(rates.includes("LISTING_ACTION_CLASS"), true);
});

test("trade listings allow authorized users to add stock even when inventory exists", () => {
  const rates = read("../src/components/dashboard/Catalog/variant-rate.tsx");

  assert.equal(rates.includes("+ Add Stock"), true);
  assert.doesNotMatch(
    rates,
    /const canAddInventory =[\s\S]{0,160}!item\.hasInventory/,
  );
  assert.match(rates, /queryKey: \["inventory-status"\]/);
  assert.equal(rates.includes('message: "Stock added successfully."'), true);
  assert.equal(rates.includes('message: "Enter a valid quantity in MT."'), true);
});

test("past marketplace listings show last-live age to admins only", () => {
  const rates = read("../src/components/dashboard/Catalog/variant-rate.tsx");

  assert.equal(rates.includes("lastLiveDateRaw"), true);
  assert.equal(rates.includes("Last live {label}"), true);
  assert.match(
    rates,
    /roleLower === "admin" &&\s+isMarketplaceView &&\s+!isLive/,
  );
  assert.equal(rates.match(/<LastLiveAgeBadge/g)?.length, 4);
});

test("listing deletion uses a stable non-dismissible confirmation modal", () => {
  const rates = read("../src/components/dashboard/Catalog/variant-rate.tsx");
  const deletion = read("../src/components/CurdTable/delete.tsx");
  assert.equal(rates.includes("const [pendingDeletion, setPendingDeletion]"), true);
  assert.equal(rates.includes("onPress={() => setPendingDeletion(item)}"), true);
  assert.equal(rates.includes("{pendingDeletion && ("), true);
  assert.equal(rates.includes("onClose={() => setPendingDeletion(null)}"), true);
  assert.equal(deletion.includes("isDismissable={false}"), true);
  assert.equal(deletion.includes("isKeyboardDismissDisabled"), true);
  assert.equal(deletion.includes("hideCloseButton={isControlled || loading}"), true);
  assert.equal(deletion.includes("if (submittingRef.current) return;"), true);
  assert.equal(deletion.includes("if (!isControlled && !nextOpen) closeModal();"), true);
  assert.equal(deletion.includes('aria-label="Close delete confirmation"'), true);
});

test("rate interest links viewers to highlighted company associates with contact actions", () => {
  const interest = read("../src/app/dashboard/rate-interest/page.tsx");
  const companies = read("../src/app/dashboard/companies/page.tsx");
  assert.equal(interest.includes("companyId=${encodeURIComponent(companyId)}&associateId=${encodeURIComponent(viewerId)}"), true);
  assert.equal(interest.includes("companyId=${encodeURIComponent(companyId)}`"), true);
  assert.equal(interest.includes("mailto:${row.viewerEmail}"), true);
  assert.equal(interest.includes("tel:${phoneHref(row.viewerPhone)}"), true);
  assert.equal(companies.includes('searchParams.get("associateId")'), true);
  assert.equal(companies.includes('scrollIntoView({ behavior: "smooth", block: "center" })'), true);
  assert.equal(companies.includes("Rate viewer"), true);
  assert.equal(companies.includes("mailto:${associateEmail}"), true);
  assert.equal(companies.includes("tel:${associatePhone.replace"), true);
});

test("variant rate wizard Commodity Directory CTA opens Commodity Directory", () => {
  const wizard = read("../src/components/dashboard/Catalog/VariantRateWizardModal.tsx");
  assert.equal(wizard.includes("Go to Commodity Directory"), true);
  assert.equal(wizard.includes("Go to Global Catalog"), false);
  assert.equal(wizard.includes('router.push("/dashboard/catalog")'), true);
  assert.equal(wizard.includes('onClick={() => router.push("/dashboard/product")}'), false);
});

test("published variant rates are status-only and expose a one-hour delete window", () => {
  const listing = read("../src/components/dashboard/Catalog/variant-rate.tsx");
  const inventory = read("../src/components/dashboard/Inventory/InventoryList.tsx");

  assert.match(listing, /LISTING_DELETE_WINDOW_MS = 60 \* 60 \* 1000/);
  assert.match(listing, /Listing locked — only status can be changed/);
  assert.doesNotMatch(listing, /rate === "variantRate"[\s\S]{0,500}<EditModal/);
  assert.match(inventory, /Price locked/);
  assert.doesNotMatch(inventory, /Update Published Rate/);
  assert.doesNotMatch(inventory, /Rate updated successfully/);
});

test("variant rate wizard uses searchable, dependent commodity controls", () => {
  const wizard = read("../src/components/dashboard/Catalog/VariantRateWizardModal.tsx");
  assert.equal(wizard.includes("CommodityPicker"), true);
  assert.equal(wizard.includes("ResizeObserver"), true);
  assert.equal(wizard.includes("fetchCatalogHierarchyOptions"), true);
  assert.equal(wizard.includes("renderCommodityAutocomplete"), true);
  assert.equal(wizard.includes('field: "category"'), true);
  assert.equal(wizard.includes('field: "subCategory"'), true);
  assert.equal(wizard.includes('field: "product"'), true);
  assert.equal(wizard.includes('field: "productVariant"'), true);
  assert.equal(wizard.includes('style={menuWidth ? { width: `${menuWidth}px`, maxWidth: "calc(100vw - 2rem)" } : undefined}'), true);
  assert.equal(wizard.includes('base: "!w-full max-w-[calc(100vw-2rem)]"'), true);
  assert.equal(wizard.includes('content: "!w-full"'), true);
  assert.equal(wizard.includes('motionProps={{ className: "w-full" }}'), true);
  assert.equal(wizard.includes('querySelector<HTMLButtonElement>("[data-commodity-trigger]")'), true);
  assert.equal(wizard.includes('data-commodity-trigger={field}'), true);
  assert.equal(wizard.includes('aria-expanded:!scale-100'), true);
  assert.equal(wizard.includes('if (nextOpen) updateMenuWidth();'), true);
  assert.equal(wizard.includes('selectionBehavior="replace"'), true);
  assert.equal(wizard.includes("onSelectionChange={(keys) =>"), true);
  assert.equal(wizard.includes("onAction={(key) =>"), false);
  assert.equal(wizard.includes('option.getClientRects().length > 0'), true);
  assert.equal(wizard.includes('trigger.getClientRects().length > 0'), true);
  assert.equal(wizard.includes('<PopoverContent\n          style={menuWidth'), false);
  assert.equal(wizard.includes('data-commodity-menu={field}'), true);
  assert.equal(wizard.includes("requestVersions.current"), true);
  assert.equal(wizard.includes("Could not load products."), true);
  assert.equal(wizard.includes(">Retry</Button>"), true);
  assert.equal(wizard.includes("max-h-[min(16rem,40vh)]"), true);
  assert.equal(wizard.includes("Select subcategory first"), true);
  assert.equal(wizard.includes('status: "idle" | "loading" | "success" | "empty" | "error"'), true);
  assert.equal(wizard.includes('new AbortController()'), true);
  assert.equal(wizard.includes("This subcategory is not associated with the selected category."), true);
  assert.equal(wizard.includes(">Refresh</Button>"), true);
  assert.equal(wizard.includes("isCurrentStepIncomplete"), true);
});

test("variant rate classification is written atomically and hierarchy remains neutral", () => {
  const wizard = read("../src/components/dashboard/Catalog/VariantRateWizardModal.tsx");
  const catalog = read("../src/app/dashboard/catalog/page.tsx");
  const categoryGrid = read("../src/components/dashboard/Catalog/category-grid.tsx");
  const productList = read("../src/components/dashboard/Catalog/product-list.tsx");

  assert.equal(wizard.includes("...classificationPayload"), true);
  assert.equal(wizard.includes("patchData"), false);
  assert.equal(wizard.includes("saving-product"), false);
  assert.equal(catalog.includes("Catalog Classification Tabs"), false);
  assert.equal(categoryGrid.includes("isConventional"), false);
  assert.equal(productList.includes("classificationBadges"), false);
  assert.equal(categoryGrid.includes("grid-cols-1 sm:grid-cols-2"), true);
});

test("catalog grid cards respond to their container without compressing controls", () => {
  const variantRate = read("../src/components/dashboard/Catalog/variant-rate.tsx");
  const globals = read("../src/app/globals.css");

  assert.equal(variantRate.includes('viewMode === "grid"\n                          ? "catalog-responsive-grid"'), true);
  assert.equal(variantRate.includes("catalog-card-compact-actions"), true);
  assert.equal(variantRate.includes('className="min-w-0 flex-1"'), true);
  assert.equal(variantRate.includes("compact?: boolean"), true);
  assert.equal(variantRate.includes("w-10 min-w-10 max-w-10 shrink-0"), true);
  assert.equal(variantRate.includes("w-full min-w-0 gap-1 px-2 text-[9px] tracking-normal"), true);
  assert.equal(variantRate.includes("catalog-card-status-row"), true);
  assert.equal(variantRate.includes("Listing status"), true);
  assert.equal(variantRate.includes('layout="inline"'), true);
  assert.equal(variantRate.includes("More options for"), true);
  assert.equal(globals.includes("repeat(auto-fill, minmax(min(100%, 13.5rem), 1fr))"), true);
  assert.equal(globals.includes("@container catalog-card (max-width: 15rem)"), true);
  assert.equal(globals.includes(".catalog-card-standard-actions"), true);
  assert.equal(globals.includes(".catalog-card-status-row"), true);
});
