import { test, expect } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  for (const width of [375, 768, 1440]) {
    test(`public preview is readable at ${width}px in ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");
      const preview = page.locator('[data-hero-panel="unified-system"]');
      await preview.scrollIntoViewIfNeeded();
      await expect(preview.getByText("Illustrative preview")).toBeVisible();
      await expect(preview.locator("li")).toHaveCount(4);
      await expect(preview.locator('[aria-current="step"]')).toContainText("Packaging");
      await expect(preview.locator("img")).toHaveCount(0);
      const previewBox = await preview.boundingBox();
      const nextBox = await page.locator('[aria-labelledby="obaol-perspective-heading"]').boundingBox();
      expect(previewBox.x).toBeGreaterThanOrEqual(0);
      expect(previewBox.x + previewBox.width).toBeLessThanOrEqual(width + 1);
      expect(nextBox.y).toBeGreaterThanOrEqual(previewBox.y + previewBox.height);
      await expect(page.locator('[data-perspective-card="true"]')).toHaveCount(3);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: `test-results/public-home-${width}-${theme}.png`, fullPage: false });
    });
  }
}

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
