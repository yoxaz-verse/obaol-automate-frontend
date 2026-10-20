import { expect, test } from "@playwright/test";

const password = "FlowTest!234";

const accounts = [
  { name: "BUY Associate", path: "/auth/associate", email: "buyer@e2e.obaol.test", role: "Associate", allowed: "/dashboard/marketplace", allowedLabel: "Trade Listings", denied: null },
  { name: "SELL Associate", path: "/auth/associate", email: "seller@e2e.obaol.test", role: "Associate", allowed: "/dashboard/product", allowedLabel: "My Trade Listings", denied: null },
  { name: "BOTH Associate", path: "/auth/associate", email: "both@e2e.obaol.test", role: "Associate", allowed: "/dashboard/enquiries", allowedLabel: "Enquiries", denied: null },
  { name: "SERVICE Associate", path: "/auth/associate", email: "service@e2e.obaol.test", role: "Associate", allowed: "/dashboard/quality-labs/execution", allowedLabel: "Lab Execution", denied: "/dashboard/product", deniedRedirect: /\/dashboard\?navigation=not-available$/ },
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
  const passwordInput = page.locator('input[type="password"]');
  if (await passwordInput.count() === 0) {
    await page.getByTestId("auth-submit").click();
    await expect(passwordInput).toBeVisible();
  }
  await passwordInput.fill(password);
  await page.getByRole("button", { name: /^Sign in with password$/i }).click();
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
      await dialog.getByRole("button", { name: account.allowedLabel, exact: true }).first().click();
    }
  } else {
    if (account.group) await page.locator("[data-sidebar]").getByRole("button", { name: new RegExp(account.group) }).click();
    await page.locator("[data-sidebar]").getByRole("button", { name: account.allowedLabel, exact: true }).first().click();
  }
  await expect(page).toHaveURL(new RegExp(`${account.allowed.replaceAll("/", "\\/")}$`));
};

test("product wizard commodity menu matches its field width", async ({ page }) => {
  if ((page.viewportSize()?.width || 0) >= 768) {
    await page.setViewportSize({ width: 1650, height: 956 });
  }
  await page.route("**/verify-token", async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    if (body?.user) {
      body.user.providedCapabilities = ["seller"];
      body.user.soughtCapabilities = ["buyer"];
    }
    await route.fulfill({ response, json: body });
  });
  const categories = [
    { id: "category-agri", name: "Agri", level: "category", parentId: null, parentName: null },
    ...Array.from({ length: 24 }, (_, index) => ({
      id: `category-${index}`,
      name: `Commodity category ${String(index + 1).padStart(2, "0")}`,
      level: "category",
      parentId: null,
      parentName: null,
    })),
  ];
  const products = [
    { id: "product-cardamom", name: "Black Cardamom", level: "product", parentId: "subcategory-grains", parentName: "Grains" },
    { id: "product-pepper", name: "Black Pepper", level: "product", parentId: "subcategory-grains", parentName: "Grains" },
  ];
  const variantRequests = [];
  await page.route("**/catalog/hierarchy-options**", async (route) => {
    const url = new URL(route.request().url());
    const selectedProduct = url.searchParams.get("product");
    let data = categories;
    if (url.searchParams.has("category")) {
      data = [{ id: "subcategory-grains", name: "Grains", level: "subCategory", parentId: "category-agri", parentName: "Agri" }];
    } else if (url.searchParams.has("subCategory")) {
      data = products;
    } else if (selectedProduct) {
      variantRequests.push(selectedProduct);
      data = selectedProduct === "product-cardamom"
        ? [{ id: "variant-cardamom-a", name: "Cardamom Grade A", level: "productVariant", parentId: selectedProduct, parentName: "Black Cardamom" }]
        : [{ id: "variant-pepper-a", name: "Pepper Grade A", level: "productVariant", parentId: selectedProduct, parentName: "Black Pepper" }];
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data }) });
  });
  await login(page, { path: "/auth/associate", email: "seller@e2e.obaol.test" });
  await page.goto("/dashboard/product");
  await expect(page).toHaveURL(/\/dashboard\/product$/);

  await page.getByRole("button", { name: /List (?:Your First Product|your product)/i }).first().click();

  const trigger = page.locator('[data-commodity-trigger="category"]').last();
  await expect(trigger).toBeVisible();
  await trigger.click();
  const menu = page.locator('[data-commodity-menu="category"]').last();
  await expect(menu).toBeVisible();
  const search = menu.getByLabel("Search category");
  await expect(search).toBeVisible();

  await expect.poll(async () => {
    const triggerBox = await trigger.boundingBox();
    const menuBox = await menu.boundingBox();
    return Math.abs((triggerBox?.width || 0) - (menuBox?.width || 0));
  }).toBeLessThanOrEqual(2);
  await expect.poll(async () => {
    const triggerBox = await trigger.boundingBox();
    const menuBox = await menu.boundingBox();
    return Math.abs((triggerBox?.x || 0) - (menuBox?.x || 0));
  }).toBeLessThanOrEqual(2);

  const scrollPanel = menu.locator('[data-picker-options="category"] > div').nth(1);
  await expect.poll(async () => scrollPanel.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
  const searchHeader = menu.locator('[data-picker-options="category"] > div').first();
  await expect.poll(async () => searchHeader.evaluate((element) => getComputedStyle(element).position)).toBe("sticky");

  const firstOption = menu.locator('[role="option"]').first();
  await expect(firstOption).toContainText("Agri");
  await firstOption.hover();
  await expect(firstOption).toHaveAttribute("data-hover", "true");
  await search.press("ArrowDown");
  await expect(firstOption).toBeFocused();
  await firstOption.press("Enter");
  await expect(trigger).toContainText("Agri");

  const subcategoryTrigger = page.locator('[data-commodity-trigger="subCategory"]').last();
  await expect(subcategoryTrigger).toBeFocused();
  await subcategoryTrigger.click();
  const subcategoryMenu = page.locator('[data-commodity-menu="subCategory"]').last();
  await expect(subcategoryMenu).toBeVisible();
  await subcategoryMenu.getByLabel("Search subcategory").press("Escape");
  await expect(subcategoryMenu).toBeHidden();

  await subcategoryTrigger.click();
  await page.locator('[data-commodity-menu="subCategory"]:visible').getByText("Grains", { exact: true }).click();
  const productTrigger = page.locator('[data-commodity-trigger="product"]').last();
  await expect(productTrigger).toBeFocused();
  await productTrigger.click();
  const productMenu = page.locator('[data-commodity-menu="product"]').last();
  await page.locator('[data-commodity-menu="product"]:visible').getByText("Black Cardamom", { exact: true }).click();
  await expect(productTrigger).toContainText("Black Cardamom");
  await expect.poll(() => variantRequests.includes("product-cardamom")).toBe(true);

  const variantTrigger = page.locator('[data-commodity-trigger="productVariant"]').last();
  await expect(variantTrigger).toBeFocused();
  await variantTrigger.click();
  const variantMenu = page.locator('[data-commodity-menu="productVariant"]').last();
  await page.locator('[data-commodity-menu="productVariant"]:visible').getByText("Cardamom Grade A", { exact: true }).click();
  await expect(variantTrigger).toContainText("Cardamom Grade A");

  await productTrigger.click();
  const visibleProductSearch = page.locator('[data-commodity-menu="product"]:visible').getByLabel("Search product");
  await visibleProductSearch.fill("Black Pepper");
  await visibleProductSearch.press("Enter");
  await expect(productTrigger).toContainText("Black Pepper");
  await expect(variantTrigger).toContainText("Search product variants");
  await expect(variantTrigger).toBeFocused();
  await expect.poll(() => variantRequests.includes("product-pepper")).toBe(true);
});

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
      await expect(page).toHaveURL(account.deniedRedirect || /\/403$/, { timeout: 10_000 });
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
  await page.getByRole("tab", { name: "Providing", exact: true }).click();
  await expect(page.getByRole("tab", { name: "Providing", exact: true })).toHaveAttribute("aria-selected", "true");
  await page.reload();
  await expect(page.getByRole("tab", { name: "Providing", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText(/selling enquir(?:y|ies)/i)).toBeVisible();
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

test("associate dashboard fetches published sidebar governance once", async ({ page }) => {
  let governanceRequests = 0;
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.endsWith("/sidebar-governance/published")) governanceRequests += 1;
  });
  await login(page, accounts[0]);
  await navigateThroughVisibleUi(page, accounts[0]);
  await expect(page.getByText("Trade Listing Discovery", { exact: true })).toBeVisible();
  await expect.poll(() => governanceRequests).toBe(1);
});

test("admin can save and publish a chip-based governance edit", async ({ page }) => {
  test.skip((page.viewportSize()?.width || 0) < 768, "publication mutation runs once in the desktop project");
  await login(page, accounts[6]);
  await page.goto("/dashboard/sidebar-governance");
  await expect(page.getByRole("heading", { name: "Sidebar Governance", exact: true })).toBeVisible();
  await page.getByLabel("Search sidebar pages").fill("Bidding");
  await page.locator('[data-governance-route="/dashboard/bidding"]').click();

  const seeking = page.getByRole("region", { name: "Seeking For" });
  await seeking.getByRole("button", { name: "Buyer", exact: true }).click();
  await expect(page.getByText("Unsaved changes", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByText("Unsaved changes", { exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: "Publish", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Publish sidebar governance?" });
  await expect(dialog).toBeVisible();
  const publish = dialog.getByRole("button", { name: "Publish complete draft", exact: true });
  await publish.focus();
  await publish.press("Enter");
  await expect(dialog).toBeHidden();
});
