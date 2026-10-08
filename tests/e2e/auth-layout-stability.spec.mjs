import { expect, test } from "@playwright/test";

const boxDelta = (before, after) => ({
  x: Math.abs(before.x - after.x),
  y: Math.abs(before.y - after.y),
  width: Math.abs(before.width - after.width),
  height: Math.abs(before.height - after.height),
});

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__authLayoutShifts = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) window.__authLayoutShifts.push(entry.value);
      }
    }).observe({ type: "layout-shift", buffered: true });
  });

  await page.route(/\/verify-token(?:\?.*)?$/, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 900));
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ success: false }),
    });
  });
  await page.route("https://accounts.google.com/gsi/client", (route) => route.abort());
});

test("Associate sign-in keeps its shell fixed while session and Google controls settle", async ({ page }) => {
  await page.goto("/auth/associate?prefill=layout%40example.com", { waitUntil: "domcontentloaded" });

  const card = page.getByTestId("auth-card");
  const form = page.getByTestId("auth-form");
  const submit = page.getByTestId("auth-submit");
  await expect(card).toBeVisible();
  await expect(form).toHaveAttribute("aria-busy", "true");
  await expect(page.getByLabel("Email Address")).toHaveValue("layout@example.com");

  const initialCard = await card.boundingBox();
  const initialSubmit = await submit.boundingBox();
  expect(initialCard).toBeTruthy();
  expect(initialSubmit).toBeTruthy();

  await expect(form).toHaveAttribute("aria-busy", "false");
  await expect(page.getByText(/Google sign-in (?:failed to load|is temporarily unavailable)/)).toBeVisible();

  const settledCard = await card.boundingBox();
  const settledSubmit = await submit.boundingBox();
  expect(boxDelta(initialCard, settledCard)).toEqual({ x: 0, y: 0, width: 0, height: 0 });
  expect(boxDelta(initialSubmit, settledSubmit)).toEqual({ x: 0, y: 0, width: 0, height: 0 });

  const cls = await page.evaluate(() => window.__authLayoutShifts.reduce((sum, value) => sum + value, 0));
  expect(cls).toBeLessThan(0.05);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("shared auth routes render without a full-screen loading replacement", async ({ page }) => {
  for (const route of ["/auth/operator", "/auth/register?intent=BUY", "/auth/operator/register", "/auth/admin", "/auth/forgot-password?role=Associate"]) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page.locator("[role='status']").filter({ hasText: /LOADING SIGN|LOADING PASSWORD/i })).toHaveCount(0);
    await expect(page.locator("[data-testid='auth-layout'], form").first()).toBeVisible();
  }
});

test("reduced-motion users get a static auth presentation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/auth/associate", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("auth-card")).toBeVisible();
  await expect(page.locator("[data-testid='auth-layout'] .h-1.w-1")).toHaveCount(0);
});
