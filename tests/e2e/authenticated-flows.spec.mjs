import { expect, test } from "@playwright/test";

const password = "FlowTest!234";

const accounts = [
  { name: "BUY Associate", path: "/auth/associate", email: "buyer@e2e.obaol.test", role: "Buyer", allowed: "/dashboard/marketplace", allowedLabel: "Trade Listings", denied: "/dashboard/product" },
  { name: "SELL Associate", path: "/auth/associate", email: "seller@e2e.obaol.test", role: "Seller", allowed: "/dashboard/product", allowedLabel: "My Trade Listings", denied: null },
  { name: "BOTH Associate", path: "/auth/associate", email: "both@e2e.obaol.test", role: "Buyer & Seller", allowed: "/dashboard/enquiries", allowedLabel: "Enquiries", denied: null },
  { name: "SERVICE Associate", path: "/auth/associate", email: "service@e2e.obaol.test", role: "Service Provider", allowed: "/dashboard/execution-enquiries", allowedLabel: "Execution Panel", denied: "/dashboard/product" },
  { name: "Operator", path: "/auth/operator", email: "operator@e2e.obaol.test", role: "Operator", allowed: "/dashboard/operator/hierarchy", allowedLabel: "Hierarchy", group: "Team & Users", denied: "/dashboard/approvals" },
  { name: "Team", path: "/auth/operator", email: "team@e2e.obaol.test", role: "Operator", allowed: "/dashboard/operator/team", allowedLabel: "Team", group: "Team & Users", denied: "/dashboard/approvals" },
  { name: "Admin", path: "/auth/admin", email: "admin@e2e.obaol.test", role: "Admin", allowed: "/dashboard/approvals", allowedLabel: "Approvals", group: "Governance", denied: null },
];

const installFailureGuards = (page) => {
  const consoleErrors = [];
  const failedRequests = [];
  page.on("console", (message) => {
    if (message.type() === "error" && !/favicon|401|ResizeObserver/i.test(message.text())) consoleErrors.push(message.text());
  });
  page.on("requestfailed", (request) => {
    const url = request.url();
    const reason = request.failure()?.errorText || "";
    if (!url.startsWith("http://localhost:5001") && !url.startsWith("http://localhost:3100")) return;
    if (/cancelled|ERR_ABORTED/i.test(reason)) return;
    failedRequests.push(`${request.method()} ${url} ${reason}`);
  });
  return () => {
    expect(failedRequests, "unexpected failed browser requests").toEqual([]);
    expect(consoleErrors, "unexpected browser console errors").toEqual([]);
  };
};

const login = async (page, account) => {
  await page.goto(account.path);
  await page.getByLabel("Email Address").fill(account.email);
  if (await page.getByLabel("Password").count() === 0) {
    await page.getByRole("button", { name: /^Sign In$/ }).click();
    await expect(page.getByLabel("Password")).toBeVisible();
  }
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /^Sign In$/ }).click();
  await expect(page).toHaveURL(/\/dashboard(?:[/?]|$)/, { timeout: 15_000 });
  await expect(page.locator("[data-dashboard-shell]")).toBeVisible();
};

const navigateThroughVisibleUi = async (page, account) => {
  const mobile = (page.viewportSize()?.width || 0) < 768;
  if (mobile) {
    const primary = page.locator("[data-bottomnav]").getByRole("link", { name: account.allowedLabel, exact: true });
    if (await primary.count()) {
      await primary.click();
    } else {
      await page.getByRole("button", { name: "More workspace navigation" }).click();
      const dialog = page.getByRole("dialog", { name: "Workspace navigation" });
      await expect(dialog).toBeVisible();
      if (account.group) {
        const group = dialog.getByRole("button", { name: new RegExp(account.group) });
        if (await group.getAttribute("aria-expanded") !== "true") await group.click();
      }
      await dialog.getByRole("button", { name: account.allowedLabel, exact: true }).click();
    }
  } else {
    if (account.group) await page.locator("[data-sidebar]").getByRole("button", { name: new RegExp(account.group) }).click();
    await page.locator("[data-sidebar]").getByRole("button", { name: account.allowedLabel, exact: true }).click();
  }
  await expect(page).toHaveURL(new RegExp(`${account.allowed.replaceAll("/", "\\/")}$`));
};

for (const account of accounts) {
  test(`${account.name} authenticates and receives scoped navigation`, async ({ page }) => {
    await login(page, account);
    const assertClean = installFailureGuards(page);
    await expect(page.getByText(account.role, { exact: true }).first()).toBeVisible();
    await navigateThroughVisibleUi(page, account);
    await expect(page.locator("[data-dashboard-shell]")).toBeVisible();
    await expect(page).not.toHaveURL(/\/403$/);
    if (account.denied) {
      await page.goto(account.denied, { waitUntil: "networkidle" });
      await expect(page).toHaveURL(/\/403$/, { timeout: 10_000 });
    }
    assertClean();
  });
}

test("pending associate reaches only the pending workspace", async ({ page }) => {
  await login(page, { path: "/auth/associate", email: "pending@e2e.obaol.test" });
  await expect(page).toHaveURL(/\/dashboard\/pending-approval$/);
  await page.goto("/dashboard/orders");
  await expect(page).toHaveURL(/\/dashboard\/pending-approval$/);
});

test("rejected associate receives an explicit login rejection", async ({ page }) => {
  await page.goto("/auth/associate");
  await page.getByLabel("Email Address").fill("rejected@e2e.obaol.test");
  await page.getByRole("button", { name: /^Sign In$/ }).click();
  await expect(page).toHaveURL(/\/auth\/associate$/);
  await expect(page.getByText(/rejected|blocked|banned|contact support|not active/i).first()).toBeVisible();
});

test("BOTH associate focus persists across reloads", async ({ page }) => {
  await login(page, accounts[2]);
  await page.getByRole("button", { name: "Selling", exact: true }).click();
  await expect(page.getByRole("button", { name: "Selling", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(page.getByRole("button", { name: "Selling", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Live listings", { exact: true })).toBeVisible();
});

test("profile uses the shared dashboard workspace styling", async ({ page }) => {
  await login(page, accounts[2]);
  await page.goto("/dashboard/profile");

  await expect(page.getByRole("heading", { name: "Profile", exact: true })).toBeVisible();
  await expect(page.getByText("Company information", { exact: true }).or(page.getByText("Complete your company profile", { exact: true }))).toBeVisible();
  await expect(page.getByText("NODE_NUL", { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  const panels = page.locator(".dashboard-panel");
  expect(await panels.count()).toBeGreaterThan(1);
  const radii = await panels.evaluateAll((elements) => elements.map((element) => Number.parseFloat(getComputedStyle(element).borderTopLeftRadius)));
  expect(Math.max(...radii)).toBeLessThanOrEqual(24);
});

test("mobile navigation exposes stable labels and restores focus after Escape", async ({ page }) => {
  test.skip((page.viewportSize()?.width || 0) >= 768, "mobile navigation behavior");
  await login(page, accounts[0]);
  const bottomNav = page.locator("[data-bottomnav]");
  await expect(bottomNav.getByText("Home", { exact: true })).toBeVisible();
  await expect(bottomNav.getByText("Trade Listings", { exact: true })).toBeVisible();
  const more = page.getByRole("button", { name: "More workspace navigation" });
  await more.focus();
  await more.press("Enter");
  await expect(page.getByRole("dialog", { name: "Workspace navigation" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Workspace navigation" })).toHaveCount(0);
  await expect(more).toBeFocused();
});
