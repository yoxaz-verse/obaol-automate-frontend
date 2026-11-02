import { test, expect } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  for (const width of [375, 768, 1024, 1440]) {
    test(`public preview is readable at ${width}px in ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");
      const stageBand = page.locator('[data-execution-stage-band="true"]');
      const stageGrid = stageBand.locator('[data-execution-stage-grid="true"]');
      if (width < 768) {
        await expect(stageBand).toBeHidden();
      } else {
        await stageBand.scrollIntoViewIfNeeded();
        await expect(stageGrid.locator('[data-execution-stage-group]')).toHaveCount(4);
        await expect(stageGrid.locator('[data-execution-stage="discovery"]')).toBeVisible();
        const stageColumns = await stageGrid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length);
        expect(stageColumns).toBe(width >= 1280 ? 4 : 2);
        const stageBox = await stageGrid.boundingBox();
        expect(stageBox.x).toBeGreaterThanOrEqual(0);
        expect(stageBox.x + stageBox.width).toBeLessThanOrEqual(width + 1);
      }

      const showcase = page.locator('[data-service-showcase="true"]');
      const servicePuzzle = page.locator('[data-service-mobile-puzzle="true"]');
      const desktopStory = page.locator('[data-service-desktop-story="true"]');
      await showcase.scrollIntoViewIfNeeded();
      await expect(showcase.getByRole("heading", { name: "Different specialists. One connected trade." })).toBeVisible();
      if (width < 1024) {
        await expect(servicePuzzle).toBeVisible();
        await expect(desktopStory).toBeHidden();
        await expect(servicePuzzle).toHaveAttribute("data-puzzle-assembled", "true");
        await expect(servicePuzzle.locator('[data-service-piece]')).toHaveCount(9);
        await expect(servicePuzzle.locator('[data-service-selected="true"]')).toHaveCount(1);
      } else {
        await expect(servicePuzzle).toBeHidden();
        await expect(desktopStory).toBeVisible();
        await expect(desktopStory.locator('[data-service-chapter]')).toHaveCount(9);
        await expect(desktopStory.locator('[data-active-service]')).toBeVisible();
        await expect(desktopStory.locator('[data-service-background-wash="true"]')).toBeVisible();
        await expect(desktopStory.locator('[data-service-depth-layer]')).toHaveCount(0);
        await expect(desktopStory.locator('[data-service-overlay-meta="true"]')).toBeVisible();
        await expect(desktopStory.locator('[data-service-overlay-chapter="true"]')).toBeVisible();
      }
      if (width === 375) {
        await expect(servicePuzzle.locator('[data-service-puzzle-grid="true"]')).toHaveAttribute("data-mobile-layout", "irregular");
        const portraitBox = await servicePuzzle.locator('[data-service-piece="sourcing"]').boundingBox();
        const compactBox = await servicePuzzle.locator('[data-service-piece="documentation"]').boundingBox();
        expect(portraitBox.height).toBeGreaterThan(compactBox.height * 1.5);
      }
      // The execution workspace is code-split. Scroll its stable server-rendered
      // boundary before asserting the interactive client content.
      await page.locator("#execution-workspace").scrollIntoViewIfNeeded();
      const preview = page.locator('[data-hero-panel="unified-system"]');
      await preview.scrollIntoViewIfNeeded();
      await expect(preview.getByRole("heading", { name: "Live connected workspace" })).toBeVisible();
      await expect(preview.locator("li")).toHaveCount(9);
      await expect(preview.locator('[aria-current="step"]')).toContainText("Inland Transport");
      await expect(preview.locator('img[alt="OBAOL panel tracking a Black Pepper export order"]')).toHaveCount(1);
      const previewBox = await preview.boundingBox();
      expect(previewBox.x).toBeGreaterThanOrEqual(0);
      expect(previewBox.x + previewBox.width).toBeLessThanOrEqual(width + 1);
      await expect(page.locator('[data-perspective-card="true"]')).toHaveCount(3);
      const executionMap = page.locator('[data-hero-panel="execution-map"]');
      const bulkArtwork = executionMap.locator('[data-hero-bulk-artwork="true"]');
      await expect(bulkArtwork).toBeVisible();
      await expect(bulkArtwork.locator('[data-hero-phase-region]')).toHaveCount(4);
      await expect(bulkArtwork.locator('[data-hero-phase-highlight]')).toHaveCount(4);
      await expect(bulkArtwork.locator('[data-hero-phase-divider="true"]')).toHaveCount(3);
      await expect(bulkArtwork.locator('[data-hero-phase-outcome-overlay="true"]')).toHaveCount(0);
      await expect(executionMap).toHaveAttribute("data-active-phase", "none");
      const phaseRail = page.locator('[data-execution-route="phase-rail"]');
      await expect(phaseRail.locator('[data-execution-phase]')).toHaveCount(4);
      expect(await phaseRail.locator('[data-execution-phase]').allTextContents()).toEqual(["Plan", "Verify", "Move", "Receive & Approve"]);
      const responsibilityNodes = phaseRail.locator('[data-execution-responsibility]');
      await expect(responsibilityNodes).toHaveCount(12);
      expect((await responsibilityNodes.allTextContents()).map((label) => label.trim())).toEqual([
        "Buyer Requirement", "Supplier Sourcing", "Sampling",
        "Documentation", "Warehouse Inspection", "Quality & COA",
        "Payment Readiness", "Packaging & Fumigation", "Inland Transport",
        "CHA & Customs", "Freight Forwarding", "Buyer Receipt & Acceptance",
      ]);
      const tradeDetail = executionMap.locator('[data-hero-trade-detail="true"]');
      await expect(tradeDetail).toBeVisible();
      await expect(tradeDetail).toContainText("Black Pepper · 18 MT");
      await expect(page.locator('[data-home-parallax-accents]')).toHaveCount(0);
      await expect(page.locator('[data-parallax-accent]')).toHaveCount(0);
      const artworkBox = await bulkArtwork.boundingBox();
      const railBox = await phaseRail.boundingBox();
      expect(artworkBox.x).toBeGreaterThanOrEqual(0);
      if (width < 1280) expect(artworkBox.x + artworkBox.width).toBeLessThanOrEqual(width + 1);
      else expect(artworkBox.x + artworkBox.width).toBeGreaterThanOrEqual(width - 24);
      expect(railBox.y).toBeGreaterThanOrEqual(artworkBox.y + artworkBox.height - 1);
      expect(railBox.x).toBeGreaterThanOrEqual(0);
      expect(railBox.x + railBox.width).toBeLessThanOrEqual(width + 1);
      if (width >= 1024) {
        const mapBeforeHover = await executionMap.boundingBox();
        const artworkBeforeHover = await bulkArtwork.boundingBox();
        const railBeforeHover = await phaseRail.boundingBox();
        const detailBeforeHover = await tradeDetail.boundingBox();
        await bulkArtwork.locator('[data-hero-phase-region="receive-and-approve"]').hover();
        await expect(executionMap).toHaveAttribute("data-active-phase", "receive-and-approve");
        await expect(tradeDetail).toHaveAttribute("data-detail-kind", "phase");
        await expect(tradeDetail).toContainText("Receive & Approve");
        const mapDuringHover = await executionMap.boundingBox();
        const artworkDuringHover = await bulkArtwork.boundingBox();
        const railDuringHover = await phaseRail.boundingBox();
        const detailDuringHover = await tradeDetail.boundingBox();
        expect(mapDuringHover).toEqual(mapBeforeHover);
        expect(artworkDuringHover).toEqual(artworkBeforeHover);
        expect(railDuringHover).toEqual(railBeforeHover);
        expect(detailDuringHover).toEqual(detailBeforeHover);
        expect(detailDuringHover.y).toBeGreaterThanOrEqual(railDuringHover.y + railDuringHover.height - 1);
        await page.mouse.move(0, 0);
        await expect(executionMap).toHaveAttribute("data-active-phase", "none");
        expect(await phaseRail.boundingBox()).toEqual(railBeforeHover);

        const customsNode = phaseRail.locator('[data-execution-responsibility="cha-customs"]');
        const customsBoxBefore = await customsNode.boundingBox();
        await customsNode.click();
        await expect(customsNode).toHaveAttribute("aria-pressed", "true");
        await expect(executionMap).toHaveAttribute("data-active-phase", "move");
        await expect(tradeDetail).toHaveAttribute("data-detail-kind", "responsibility");
        await expect(tradeDetail).toContainText("CHA & Customs");
        await expect(tradeDetail).toContainText("Licensed Customs House Agent or customs broker");
        expect(await customsNode.boundingBox()).toEqual(customsBoxBefore);
        expect(await bulkArtwork.boundingBox()).toEqual(artworkBeforeHover);
        expect(await phaseRail.boundingBox()).toEqual(railBeforeHover);
        expect(await tradeDetail.boundingBox()).toEqual(detailBeforeHover);
      }
      const hierarchyIsCorrect = await page.evaluate(() => {
        const workspace = document.querySelector("#capability-explorer");
        const stages = document.querySelector('[data-execution-stage-band="true"]');
        return Boolean(workspace && stages && (workspace.compareDocumentPosition(stages) & Node.DOCUMENT_POSITION_FOLLOWING));
      });
      expect(hierarchyIsCorrect).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: `test-results/public-home-${width}-${theme}.png`, fullPage: false });
    });
  }
}

test("service puzzle reveals every service with accessible selection", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    const nativeMatchMedia = window.matchMedia.bind(window);
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: (query) => {
        if (query.includes("hover: none") || query.includes("pointer: coarse") || query.includes("update: slow")) {
          return {
            matches: false,
            media: query,
            onchange: null,
            addEventListener() {},
            removeEventListener() {},
            addListener() {},
            removeListener() {},
            dispatchEvent() { return true; },
          };
        }
        return nativeMatchMedia(query);
      },
    });
  });
  await page.goto("/");

  const puzzle = page.locator('[data-service-puzzle="true"]');
  await puzzle.scrollIntoViewIfNeeded();
  await expect(puzzle).toHaveAttribute("data-puzzle-assembled", "true");
  await expect(puzzle.locator('[data-service-piece]')).toHaveCount(9);

  const services = [
    ["discovery", "Discovery"], ["sourcing", "Sourcing"], ["documentation", "Documentation & Planning"],
    ["procurement", "Procurement"], ["quality", "Quality Testing"], ["packaging", "Packaging"],
    ["logistics", "Logistics"], ["warehouse", "Warehouse"], ["freight", "Freight Forwarding"],
  ];

  for (const [id, title] of services) {
    const piece = puzzle.locator(`[data-service-piece="${id}"]`);
    await piece.click();
    await expect(piece).toHaveAttribute("aria-pressed", "true");
    await expect(piece).toHaveAttribute("data-service-selected", "true");
    await expect(piece.getByRole("heading", { name: title })).toBeVisible();
    await expect(piece.locator('[data-service-partial-image="false"]')).toHaveCount(1);
    await expect(puzzle.locator('[data-service-selected="true"]')).toHaveCount(1);
  }

  const sourcing = puzzle.locator('[data-service-piece="sourcing"]');
  await sourcing.focus();
  await page.keyboard.press("Enter");
  await expect(sourcing).toHaveAttribute("aria-pressed", "true");
  await expect(puzzle.locator('[aria-live="polite"]')).toContainText("Selected service: Sourcing");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("desktop hero spotlights and persists each bulk execution phase", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    const nativeMatchMedia = window.matchMedia.bind(window);
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: (query) => {
        if (query.includes("hover: none") || query.includes("pointer: coarse") || query.includes("update: slow")) {
          return { matches: false, media: query, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return true; } };
        }
        return nativeMatchMedia(query);
      },
    });
  });
  await page.goto("/");

  const scene = page.locator('[data-hero-panel="execution-map"]');
  const hero = page.locator('[data-natural-scroll-hero="true"]');
  const centeredLayout = hero.locator('[data-hero-centered-layout="true"]');
  await expect(hero.locator('[data-home-parallax-accents]')).toHaveCount(0);
  const heroBox = await hero.boundingBox();
  const layoutBox = await centeredLayout.boundingBox();
  const artwork = scene.locator('[data-hero-bulk-artwork="true"]');
  const artworkBox = await artwork.boundingBox();
  const phaseRailBox = await scene.locator('[data-execution-route="phase-rail"]').boundingBox();
  expect(heroBox.height).toBeGreaterThanOrEqual(700);
  expect(Math.abs((layoutBox.y + layoutBox.height / 2) - (heroBox.y + heroBox.height / 2))).toBeLessThan(45);
  expect(artworkBox.width).toBeGreaterThan(layoutBox.width * 0.55);
  expect(artworkBox.x + artworkBox.width).toBeGreaterThanOrEqual(1416);
  expect(phaseRailBox.y).toBeGreaterThanOrEqual(artworkBox.y + artworkBox.height - 1);

  const planRegion = artwork.locator('[data-hero-phase-region="plan"]');
  const verifyRegion = artwork.locator('[data-hero-phase-region="verify"]');
  const planHighlight = artwork.locator('[data-hero-phase-highlight="plan"]');
  const verifyRail = scene.locator('[data-execution-phase="verify"]');

  await planRegion.hover();
  await expect(scene).toHaveAttribute("data-active-phase", "plan");
  await expect(planHighlight).toHaveCSS("opacity", "1");
  await planRegion.click();
  await expect(planRegion).toHaveAttribute("aria-pressed", "true");
  await page.mouse.move(0, 0);
  await expect(scene).toHaveAttribute("data-active-phase", "plan");

  await verifyRegion.hover();
  await expect(scene).toHaveAttribute("data-active-phase", "verify");
  await page.mouse.move(0, 0);
  await expect(scene).toHaveAttribute("data-active-phase", "plan");

  await verifyRail.focus();
  await expect(scene).toHaveAttribute("data-active-phase", "verify");
  await page.keyboard.press("Enter");
  await expect(verifyRail).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Tab");
  await expect(scene).toHaveAttribute("data-active-phase", "verify");
});

test("centered desktop hero remains contained on a short laptop viewport", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 650 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const hero = page.locator('[data-natural-scroll-hero="true"]');
  const layout = hero.locator('[data-hero-centered-layout="true"]');
  const scene = hero.locator('[data-hero-panel="execution-map"]');
  await expect(layout).toBeVisible();
  await expect(scene).toHaveAttribute("data-active-phase", "none");
  await expect(hero.locator('[data-home-parallax-accents]')).toHaveCount(0);
  await expect(hero.getByRole("link", { name: /Open Workspace|Join the Open Platform/ })).toBeVisible();
  const paragraphBox = await hero.getByText("Buyers, bulk suppliers, and independent execution partners coordinate domestic and international commodity trade through shared technology, clear handoffs, and visible progress.").boundingBox();
  const ctaBox = await hero.getByRole("link", { name: /Open Workspace|Join the Open Platform/ }).boundingBox();
  const heroBox = await hero.boundingBox();
  const sceneBox = await scene.boundingBox();
  expect(sceneBox.y).toBeGreaterThanOrEqual(heroBox.y);
  expect(sceneBox.y + sceneBox.height).toBeLessThanOrEqual(heroBox.y + heroBox.height + 1);
  expect(ctaBox.y - (paragraphBox.y + paragraphBox.height)).toBeGreaterThanOrEqual(32);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("desktop service story synchronizes in both scroll directions", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    const nativeMatchMedia = window.matchMedia.bind(window);
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: (query) => {
        if (query.includes("hover: none") || query.includes("pointer: coarse") || query.includes("update: slow")) {
          return { matches: false, media: query, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return true; } };
        }
        return nativeMatchMedia(query);
      },
    });
  });
  await page.goto("/");

  const story = page.locator('[data-service-desktop-story="true"]');
  await expect(story).toBeVisible();
  const activePanel = story.locator('[data-active-service]');
  for (const id of ["discovery", "quality", "freight", "documentation", "discovery"]) {
    await story.locator(`[data-service-chapter="${id}"]`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(120);
    await expect(activePanel).toHaveAttribute("data-active-service", id);
  }
  await expect(activePanel.locator('[data-service-artwork-layer="true"]')).toHaveCount(9);
  const washBox = await activePanel.locator('[data-service-background-wash="true"]').boundingBox();
  expect(washBox.x).toBeGreaterThanOrEqual(0);
  expect(washBox.x + washBox.width).toBeLessThanOrEqual(1441);
  await expect(activePanel.locator('[data-service-overlay-meta="true"]')).toContainText("Indian origin operations");
  await expect(activePanel.locator('[data-service-overlay-chapter="true"]')).toContainText("Active chapter");
  await expect(activePanel.locator('[data-service-depth-layer]')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("public navigation supports keyboard dismissal and private styling stays isolated", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Open menu", exact: true });
  await menu.click();
  await expect(page.getByRole("navigation", { name: "All public pages" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(page.getByRole("navigation", { name: "All public pages" })).toHaveCount(0);
  await page.goto("/auth");
  await expect(page.locator(".obaol-public")).toHaveCount(0);
});

for (const route of ["/about", "/roles", "/procurement", "/methods", "/privacy-policy"]) {
  test(`shared public styles on ${route}`, async ({ page }) => {
    for (const width of [375, 768, 1440]) {
      for (const theme of ["light", "dark"]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(route);
        await page.evaluate((value) => { document.documentElement.classList.remove("light", "dark"); document.documentElement.classList.add(value); }, theme);
        await expect(page.locator(".obaol-public")).toBeVisible();
        await expect(page.locator("header").first()).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
    }
  });
}

for (const route of ["/roles", "/roles/operator", "/roles/associate", "/roles/associate/traders"]) {
  test(`role layout uses the shared compact scale on ${route}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });

    for (const width of [375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(route);

      const heading = page.locator("main h1, .public-content-wrapper h1").first();
      await expect(heading).toBeVisible();
      const geometry = await heading.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return {
          fontSize: Number.parseFloat(getComputedStyle(element).fontSize),
          left: rect.left,
          right: rect.right,
        };
      });

      expect(geometry.fontSize).toBeLessThanOrEqual(width < 640 ? 40 : 56);
      expect(geometry.left).toBeGreaterThanOrEqual(0);
      expect(geometry.right).toBeLessThanOrEqual(width + 1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

      const contentContainer = page.locator(".public-layout-container").first();
      if (await contentContainer.count()) {
        const containerWidth = await contentContainer.evaluate((element) => element.getBoundingClientRect().width);
        expect(containerWidth).toBeLessThanOrEqual(1296);
      }
    }
  });
}

test("associate directory exposes participation paths, grouped roles, and role guidance", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/roles/associate");

  const paths = page.locator('[data-testid="associate-participation-paths"]');
  await expect(paths.getByRole("heading")).toHaveCount(4);
  for (const label of ["Buy commodities", "Sell commodities", "Buy & sell", "Provide trade services"]) {
    await expect(paths.getByRole("heading", { name: label, exact: true })).toBeVisible();
  }
  await expect(page.locator("[data-associate-group]")) .toHaveCount(4);
  await expect(page.locator('a[href^="/roles/associate/"]')).toHaveCount(15);
  await expect(page.getByTestId("associate-role-card")).toHaveCount(15);
  for (const card of await page.getByTestId("associate-role-card").all()) {
    await expect(card.getByTestId("associate-card-features").locator("li")).toHaveCount(2);
  }
  await expect(page.getByTestId("associate-role-card").first().getByText("Available now", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "You represent a registered company" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "You are joining as an individual" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Register an Associate company/ })).toHaveAttribute("href", "/auth/register");

  await page.goto("/roles/associate/traders");
  await expect(page.getByRole("heading", { name: "Is this your business?" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What your company is responsible for" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "How the workflow starts on OBAOL" })).toHaveCount(0);
  await expect(page.getByText("Available now", { exact: true })).toBeVisible();
  await expect(page.getByText("Coming next", { exact: true })).toBeVisible();
  await expect(page.getByText("Collaborate with OBAOL", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What to prepare for registration" })).toHaveCount(0);
  const capabilitySections = page.getByTestId("associate-capability-sections").locator("article");
  await expect(capabilitySections).toHaveCount(3);
  await expect(capabilitySections.nth(0)).toContainText("Available now");
  await expect(capabilitySections.nth(1)).toContainText("Coming next");
  await expect(capabilitySections.nth(2)).toContainText("Collaborate with OBAOL");
  const capabilityBox = await page.getByRole("heading", { name: "Features for Traders" }).boundingBox();
  const qualificationBox = await page.getByRole("heading", { name: "Is this your business?" }).boundingBox();
  expect(capabilityBox.y).toBeLessThan(qualificationBox.y);
  await expect(page.getByRole("link", { name: /Register and discuss collaboration/ })).toHaveAttribute("href", /intent=BOTH/);
  await expect(page.getByRole("link", { name: "Register as an Associate" })).toHaveAttribute("href", /intent=BOTH.*prefill=Traders/);
  await expect(page.getByRole("link", { name: /Register your trading company/ }).first()).toHaveAttribute("href", /intent=BOTH/);
});

test("About marketing sections use one responsive content container", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/about");

    await expect(page.locator(".public-reading-page")).toHaveCount(0);

    const aboutSection = page.locator("#about");
    const sectionBox = await aboutSection.boundingBox();
    expect(sectionBox.x).toBeLessThanOrEqual(1);
    expect(sectionBox.width).toBeGreaterThanOrEqual(width - 1);

    const headingBox = await page.getByRole("heading", { name: "Who We Are" }).boundingBox();
    const imageBox = await page.getByRole("img", { name: "Jacob Alwin, Entrepreneur" }).boundingBox();

    if (width >= 768) {
      expect(imageBox.x).toBeGreaterThan(headingBox.x + headingBox.width);
    } else {
      expect(imageBox.y).toBeGreaterThan(headingBox.y + headingBox.height);
    }

    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test("theme toggle remains interactive", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const initial = await page.locator("html").getAttribute("class");
  await page.getByRole("button", { name: "Toggle theme" }).filter({ visible: true }).click();
  await expect(page.locator("html")).not.toHaveAttribute("class", initial);
});

test("retired public sections redirect home, including detail URLs", async ({ page }) => {
  for (const route of ["/trade-directory", "/trade-directory/example", "/product", "/product/example", "/companies", "/companies/example", "/obaol", "/obaol/example/product"]) {
    await page.goto(route);
    await expect(page).toHaveURL("/");
  }
});

test("Methods heading remains below the public header", async ({ page }) => {
  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/methods");
    const headerBottom = await page.locator(".public-header-shell").evaluate(el => el.getBoundingClientRect().bottom);
    const headingTop = await page.getByRole("heading", { name: "Relationship Methods" }).evaluate(el => el.getBoundingClientRect().top);
    expect(headingTop).toBeGreaterThan(headerBottom);
  }
});

test("public pages keep compact, uniform vertical spacing", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/commission-structure");
    await page.waitForTimeout(700);

    const headerBottom = await page.locator(".public-header-shell").evaluate((element) => element.getBoundingClientRect().bottom);
    const eyebrowTop = await page.getByText("Commission Structure", { exact: true }).evaluate((element) => element.getBoundingClientRect().top);
    const heroBottom = await page.getByText(/Simple, step-by-step explanation/).evaluate((element) => element.getBoundingClientRect().bottom);
    const firstPanelTop = await page.locator(".public-layout-container > div.grid").first().evaluate((element) => element.getBoundingClientRect().top);

    expect(eyebrowTop - headerBottom).toBeGreaterThanOrEqual(16);
    expect(eyebrowTop - headerBottom).toBeLessThanOrEqual(72);
    expect(firstPanelTop - heroBottom).toBeLessThanOrEqual(72);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
