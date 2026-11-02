import { test, expect } from "@playwright/test";

const destinations = [
  "/dashboard/marketplace",
  "/dashboard/inventory",
  "/dashboard/enquiries",
  "/dashboard/orders",
  "/dashboard/profile",
];

test("priority dashboard transitions publish bounded readiness timings", async ({ page }, testInfo) => {
  test.skip(!process.env.E2E_AUTH_COOKIE, "Set E2E_AUTH_COOKIE to run authenticated navigation timing checks.");
  await page.context().addCookies([{
    name: "auth_token",
    value: process.env.E2E_AUTH_COOKIE,
    domain: "localhost",
    path: "/",
  }]);
  await page.addInitScript(() => {
    window.__navigationTimings = [];
    window.addEventListener("obaol:navigation-timing", (event) => window.__navigationTimings.push(event.detail));
  });
  await page.goto("/dashboard");

  const results = [];
  for (const destination of destinations) {
    let link = page.locator(`[data-navigation-target="${destination}"]:visible`).first();
    if (!(await link.count())) {
      await page.getByRole("button", { name: "More workspace navigation" }).click();
      link = page.locator(`[data-navigation-target="${destination}"]:visible`).first();
    }
    await expect(link).toBeVisible();
    await page.evaluate((path) => {
      document.querySelector(`[data-navigation-target="${path}"]`)?.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    }, destination);
    await link.click();
    await page.waitForURL((url) => url.pathname === destination);
    const timing = await page.waitForFunction(() => window.__navigationTimings.at(-1)).then((handle) => handle.jsonValue());
    results.push({
      destination,
      prefetched: timing.prefetched,
      routeCommitMs: timing.routeCommittedAt - timing.startedAt,
      contentReadyMs: timing.contentReadyAt - timing.startedAt,
    });
    expect(results.at(-1).contentReadyMs).toBeLessThan(timing.prefetched ? 1000 : 2500);
  }
  await testInfo.attach("dashboard-navigation-timings", {
    body: JSON.stringify(results, null, 2),
    contentType: "application/json",
  });
});
