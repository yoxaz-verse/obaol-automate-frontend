import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route(/\/verify-token(?:\?.*)?$/, (route) => route.fulfill({
    status: 401,
    contentType: "application/json",
    body: JSON.stringify({ success: false }),
  }));
  await page.route("https://accounts.google.com/gsi/client", (route) => route.abort());
});

test("unified sign-in is responsive, accessible, and preserves email", async ({ page }) => {
  await page.goto("/auth?prefill=layout%40example.com", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("unified-auth")).toBeVisible();
  await expect(page.getByLabel("Email address")).toHaveValue("layout@example.com");
  await expect(page.getByRole("button", { name: "Sign in" })).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByTestId("auth-submit").click();
  await expect(page.locator("input[autocomplete='current-password']")).toBeFocused();
  await expect(page.getByRole("button", { name: "Sign in with email code" })).toBeVisible();
  await expect(page.getByText(/does not reveal whether an email is registered/i)).toBeVisible();
});

test("legacy public auth URLs redirect into the unified flow with safe context", async ({ page }) => {
  await page.goto("/auth/operator/register?prefill=operator%40example.com&intent=SERVICE");
  await expect(page).toHaveURL(/\/auth\?.*mode=signup.*role=operator.*prefill=operator(?:%40|@)example(?:\.|%2E)com.*intent=SERVICE/);
  await expect(page.getByLabel("Email address")).toHaveValue("operator@example.com");
  await page.goto("/auth/associate?prefill=associate%40example.com&reason=account-exists");
  await expect(page).toHaveURL(/\/auth\?mode=signin.*prefill=associate/);
  await expect(page.getByText(/account already exists/i)).toHaveCount(0);
});

test("OTP sign-in uses a neutral response and reveals no account role", async ({ page }) => {
  await page.route(/\/verification\/send-otp-existing$/, async (route) => {
    expect(route.request().postDataJSON()).toEqual({ method: "email", email: "private@example.com" });
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, message: "If this email is eligible, a verification code has been sent." }) });
  });
  await page.goto("/auth");
  await page.getByLabel("Email address").fill("private@example.com");
  await page.getByTestId("auth-submit").click();
  await page.getByRole("button", { name: "Sign in with email code" }).click();
  await expect(page.getByLabel("Six-digit email code")).toBeVisible();
  await expect(page.getByText("If this email is eligible, a verification code has been sent.")).toBeVisible();
});

test("signup chooses an account type and cannot continue before OTP verification", async ({ page }) => {
  await page.route(/\/auth\/onboarding\/start$/, async (route) => {
    expect(route.request().postDataJSON()).toEqual({ email: "new.operator@example.com", role: "Operator" });
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, message: "If this email is eligible, a verification code has been sent." }) });
  });
  await page.goto("/auth?mode=signup&role=operator&intent=SERVICE");
  await page.getByLabel("Email address").fill("new.operator@example.com");
  await page.getByRole("button", { name: "Verify email" }).click();
  await expect(page.getByLabel("Six-digit email code")).toBeVisible();
  await expect(page.getByRole("button", { name: "Verify and continue" })).toBeDisabled();
});

test("password sign-in uses the unified role-free endpoint", async ({ page }) => {
  await page.route(/\/auth\/unified\/password$/, async (route) => {
    const body = route.request().postDataJSON();
    expect(body).toMatchObject({ email: "member@example.com", password: "Passw0rd!", rememberMe: true });
    expect(body).not.toHaveProperty("role");
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ success: false, code: "INVALID_CREDENTIALS", message: "Invalid email or password." }) });
  });
  await page.goto("/auth");
  await page.getByLabel("Email address").fill("member@example.com");
  await page.getByTestId("auth-submit").click();
  await page.locator("input[autocomplete='current-password']").fill("Passw0rd!");
  await page.getByLabel(/Keep me signed in/).check();
  await page.getByRole("button", { name: "Sign in with password" }).click();
  await expect(page.getByText("The email or password is incorrect.", { exact: true })).toBeVisible();
});

test("unsupported browsers omit the passkey control", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(globalThis, "PublicKeyCredential", { configurable: true, value: undefined }));
  await page.goto("/auth");
  await page.getByLabel("Email address").fill("password@example.com");
  await page.getByTestId("auth-submit").click();
  await expect(page.getByTestId("passkey-signin")).toHaveCount(0);
});

test("reduced-motion users get a static auth presentation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/auth", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("auth-card")).toBeVisible();
  await expect(page.locator("[data-testid='auth-layout'] .h-1.w-1")).toHaveCount(0);
});
