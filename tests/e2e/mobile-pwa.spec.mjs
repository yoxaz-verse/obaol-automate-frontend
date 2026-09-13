import { expect, test } from "@playwright/test";

const dashboardRoutes = [
  "/dashboard",
  "/dashboard/product",
  "/dashboard/marketplace",
  "/dashboard/enquiries",
  "/dashboard/orders",
  "/dashboard/profile",
  "/dashboard/inventory",
];

const mockUser = {
  id: "e2e-associate",
  email: "mobile-pwa@example.com",
  name: "Mobile PWA Tester",
  role: "Associate",
  tradeMode: "BOTH",
  companyInterests: ["WAREHOUSE", "LOGISTICS", "QUALITY_LAB"],
  onboardingComplete: true,
  registrationStatus: "APPROVED",
  verified: { email: true, phone: true, gst: true },
};

const emptyList = {
  success: true,
  data: [],
  total: 0,
  page: 1,
  limit: 10,
};

const routeMocks = [
  [/\/api\/v1\/web\/verify-token(?:\?.*)?$/, { success: true, user: mockUser }],
  [/\/api\/v1\/web\/notifications\/unread-summary(?:\?.*)?$/, { success: true, data: {} }],
  [/\/api\/v1\/web\/notifications\/unread-count(?:\?.*)?$/, { success: true, data: { count: 0 } }],
  [/\/api\/v1\/web\/notifications(?:\?.*)?$/, emptyList],
  [/\/api\/v1\/web\/analytics\/summary\/dashboard(?:\?.*)?$/, { success: true, data: {} }],
  [/\/api\/v1\/web\/products(?:\?.*)?$/, emptyList],
  [/\/api\/v1\/web\/catalog(?:\?.*)?$/, emptyList],
  [/\/api\/v1\/web\/variant-rates(?:\?.*)?$/, emptyList],
  [/\/api\/v1\/web\/trade-directory(?:\?.*)?$/, emptyList],
  [/\/api\/v1\/web\/inquiries(?:\?.*)?$/, emptyList],
  [/\/api\/v1\/web\/orders(?:\?.*)?$/, emptyList],
  [/\/api\/v1\/web\/inventory(?:\?.*)?$/, emptyList],
  [/\/api\/v1\/web\/associate-companies(?:\?.*)?$/, emptyList],
  [/\/api\/v1\/web\/warehouses(?:\?.*)?$/, emptyList],
  [/\/api\/v1\/web\/quality-labs(?:\?.*)?$/, emptyList],
];

test.beforeEach(async ({ context, page }) => {
  await context.addCookies([
    {
      name: "auth_token",
      value: "e2e-mobile-token",
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  await page.addInitScript(() => {
    window.localStorage.setItem("sidebarCollapsed", "true");
  });

  await page.route(/\/api\/v1\/web(?:\/|\?|$)/, async (route) => {
    const url = route.request().url();
    const origin = route.request().headers().origin || "http://127.0.0.1:3000";
    const match = routeMocks.find(([pattern]) => pattern.test(url));
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({
        status: 204,
        headers: {
          "access-control-allow-origin": origin,
          "access-control-allow-credentials": "true",
          "access-control-allow-headers": "content-type,identifier,x-language,ngrok-skip-browser-warning",
          "access-control-allow-methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
        },
      });
      return;
    }
    await route.fulfill({
      status: match ? 200 : 200,
      contentType: "application/json",
      headers: {
        "access-control-allow-origin": origin,
        "access-control-allow-credentials": "true",
      },
      body: JSON.stringify(match ? match[1] : emptyList),
    });
  });
});

test("manifest is installable and honest about dashboard PWA defaults", async ({ request }) => {
  const response = await request.get("/manifest.webmanifest");
  expect(response.ok()).toBeTruthy();

  const manifest = await response.json();
  expect(manifest.name).toBe("OBAOL Supreme");
  expect(manifest.short_name).toBe("OBAOL");
  expect(manifest.start_url).toBe("/dashboard");
  expect(manifest.scope).toBe("/");
  expect(manifest.display).toBe("standalone");
  expect(manifest.orientation).toBe("portrait");
  expect(manifest.theme_color).toBe("#cf983c");
  expect(Array.isArray(manifest.icons)).toBeTruthy();
  expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
});

for (const route of dashboardRoutes) {
  test(`${route} renders in mobile PWA viewport without shell regressions`, async ({ page }) => {
    const consoleErrors = [];
    const failedRequests = [];

    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("requestfailed", (request) => {
      failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText || ""}`.trim());
    });

    await page.goto(route, { waitUntil: "networkidle" });
    await expect(page.locator("#main-content")).toBeVisible();
    await expect(page.locator("[data-bottomnav]")).toBeVisible();
    await expect(page.locator("[data-sidebar]")).toHaveCount(1);
    await expect(page.locator("[data-dashboard-scroll]")).toBeVisible();

    const layout = await page.evaluate(() => {
      const root = document.documentElement;
      const body = document.body;
      const bottomNav = document.querySelector("[data-bottomnav]");
      const bottomNavRect = bottomNav?.getBoundingClientRect();
      const links = [...document.querySelectorAll("[data-bottomnav] a, [data-bottomnav] [aria-disabled='true']")];
      const tapTargets = links.map((node) => {
        const rect = node.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      });
      const serviceWorkers = "serviceWorker" in navigator
        ? navigator.serviceWorker.getRegistrations().then((registrations) => registrations.length)
        : Promise.resolve(0);

      return Promise.resolve(serviceWorkers).then((serviceWorkerCount) => ({
        viewportWidth: window.innerWidth,
        documentWidth: root.scrollWidth,
        bodyWidth: body.scrollWidth,
        bottomNavVisible: Boolean(bottomNavRect && bottomNavRect.width > 0 && bottomNavRect.height > 0),
        bottomNavBottom: bottomNavRect ? window.innerHeight - bottomNavRect.bottom : null,
        minTapWidth: Math.min(...tapTargets.map((target) => target.width)),
        minTapHeight: Math.min(...tapTargets.map((target) => target.height)),
        serviceWorkerCount,
      }));
    });

    expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);
    expect(layout.bodyWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);
    expect(layout.bottomNavVisible).toBeTruthy();
    expect(layout.bottomNavBottom).toBeGreaterThanOrEqual(0);
    expect(layout.minTapWidth).toBeGreaterThanOrEqual(44);
    expect(layout.minTapHeight).toBeGreaterThanOrEqual(44);
    expect(layout.serviceWorkerCount).toBe(0);
    expect(failedRequests).toEqual([]);
    expect(consoleErrors.filter((text) => !/favicon|ResizeObserver/i.test(text))).toEqual([]);
  });
}

test("mobile auth screen keeps Associate and Operator paths distinct", async ({ page }) => {
  await page.goto("/auth", { waitUntil: "networkidle" });
  await expect(page.getByText("For companies and trade businesses")).toBeVisible();
  await expect(page.getByText("For OBAOL-approved execution specialists")).toBeVisible();
  await expect(page.getByRole("link", { name: "Register as Associate" })).toHaveAttribute("href", "/auth/register");
  await expect(page.getByRole("link", { name: "Register as Operator" })).toHaveAttribute("href", "/auth/operator/register");
  await expect(page.getByRole("link", { name: "Sign in as Associate" })).toHaveAttribute("href", "/auth/associate");
  await expect(page.getByRole("link", { name: "Sign in as Operator" })).toHaveAttribute("href", "/auth/operator");
});

test("auth actions fit the first viewport and the trade flow stays below them", async ({ page }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1366, height: 768 }]) {
    await page.setViewportSize(viewport);
    for (const theme of ["light", "dark"]) {
      await page.goto("/auth?prefill=hello%2Btrade%40example.com");
      await page.evaluate((value) => { document.documentElement.classList.remove("light", "dark"); document.documentElement.classList.add(value); }, theme);
      const links = ["Register as Associate", "Sign in as Associate", "Register as Operator", "Sign in as Operator"];
      for (const name of links) {
        const link = page.getByRole("link", { name });
        await expect(link).toBeVisible();
        const box = await link.boundingBox();
        expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
      }
      await expect(page.getByRole("link", { name: "Sign in as Associate" })).toHaveAttribute("href", "/auth/associate?prefill=hello%2Btrade%40example.com");
      await expect(page.getByRole("link", { name: "Sign in as Operator" })).toHaveAttribute("href", "/auth/operator?prefill=hello%2Btrade%40example.com");
      const flow = page.getByRole("list", { name: "How OBAOL trade flows" });
      await expect(flow.getByRole("listitem")).toHaveText([
        "Commodity discovery", "Verified partners", "Execution workflows", "Documents and orders",
      ]);
      const flowBox = await flow.boundingBox();
      const lastActionBox = await page.getByRole("link", { name: "Sign in as Operator" }).boundingBox();
      expect(flowBox.y).toBeGreaterThan(lastActionBox.y + lastActionBox.height);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
});
