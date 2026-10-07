import { test, expect } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  for (const width of [375, 768, 1440]) {
    test(`public preview is readable at ${width}px in ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");
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
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: `test-results/public-home-${width}-${theme}.png`, fullPage: false });
    });
  }
}

test("service scroll story keeps every chapter synchronized in both directions", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
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

  const story = page.locator('[data-service-story="true"]');
  await story.scrollIntoViewIfNeeded();
  const panel = story.locator("[data-active-service]");
  await expect(panel).toBeVisible();

  const chapterIds = ["sourcing", "documentation", "procurement", "quality", "packaging", "logistics", "warehouse", "freight"];
  const assertChapter = async (id) => {
    await story.locator(`[data-service-chapter="${id}"]`).evaluate((element) => element.scrollIntoView({ block: "center" }));
    await expect(panel).toHaveAttribute("data-active-service", id);
  };

  for (const id of chapterIds) await assertChapter(id);
  for (const id of [...chapterIds].reverse()) await assertChapter(id);
  await assertChapter("warehouse");
  await assertChapter("documentation");
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
  await expect(page.getByRole("heading", { name: "You represent a registered company" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "You are joining as an individual" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Register an Associate company/ })).toHaveAttribute("href", "/auth/register");

  await page.goto("/roles/associate/traders");
  await expect(page.getByRole("heading", { name: "Is this your business?" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What your company is responsible for" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "How the workflow starts on OBAOL" })).toBeVisible();
  await expect(page.getByText("Available now", { exact: true })).toBeVisible();
  await expect(page.getByText("Coming next", { exact: true })).toBeVisible();
  await expect(page.getByText("Collaborate with OBAOL", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What to prepare for registration" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Register and discuss collaboration/ })).toHaveAttribute("href", /intent=BOTH/);
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
