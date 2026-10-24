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
  await expect(page.getByRole("link", { name: "Forgot password?" })).toBeVisible();
  await expect(page.getByText(/does not reveal whether an email is registered/i)).toBeVisible();
});

test("forgot-password entry preserves email and requires a public account type", async ({ page }) => {
  await page.goto("/auth");
  await page.getByLabel("Email address").fill("member+reset@example.com");
  await page.getByTestId("auth-submit").click();
  await page.getByRole("link", { name: "Forgot password?" }).click();

  await expect(page).toHaveURL(/\/auth\/forgot-password\?prefill=member%2Breset%40example(?:\.|%2E)com/);
  await expect(page.getByLabel("Email Address")).toHaveValue("member+reset@example.com");
  await expect(page.getByRole("radio", { name: "Associate" })).not.toBeChecked();
  await expect(page.getByRole("radio", { name: "Operator" })).not.toBeChecked();
  await expect(page.getByRole("button", { name: "Send OTP" })).toBeDisabled();
});

test("forgot-password sends the selected public role", async ({ page }) => {
  await page.route(/\/auth\/forgot-password$/, async (route) => {
    expect(route.request().postDataJSON()).toEqual({ email: "operator@example.com", role: "Operator" });
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
  });

  await page.goto("/auth/forgot-password?prefill=operator%40example.com");
  await page.getByRole("radio", { name: "Operator" }).check();
  await page.getByRole("button", { name: "Send OTP" }).click();
  await expect(page.getByText("operator@example.com")).toBeVisible();
});

test("explicit password-reset roles remain locked to legacy account flows", async ({ page }) => {
  await page.goto("/auth/forgot-password?role=CustomerSupport&prefill=support%40example.com");
  await expect(page.getByText("CustomerSupport Account")).toBeVisible();
  await expect(page.getByRole("radio", { name: "Associate" })).toHaveCount(0);
  await expect(page.getByRole("radio", { name: "Operator" })).toHaveCount(0);
  await page.getByRole("button", { name: "Back to sign in" }).click();
  await expect(page).toHaveURL(/\/auth\/customer-support$/);
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

test("existing-email signup switches to sign-in without opening OTP verification", async ({ page }) => {
  await page.route(/\/auth\/onboarding\/start$/, async (route) => {
    expect(route.request().postDataJSON()).toEqual({ email: "existing@example.com", role: "Associate" });
    await route.fulfill({
      status: 409,
      contentType: "application/json",
      body: JSON.stringify({
        success: false,
        code: "ACCOUNT_EXISTS",
        message: "An account already exists for this email. Please sign in.",
      }),
    });
  });

  await page.goto("/auth?mode=signup&role=associate");
  await page.getByLabel("Email address").fill("existing@example.com");
  await page.getByRole("button", { name: "Verify email" }).click();

  await expect(page.getByRole("button", { name: "Sign in" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Email address")).toHaveValue("existing@example.com");
  await expect(page.getByText("An account already exists for this email. Please sign in instead.")).toBeVisible();
  await expect(page.getByLabel("Six-digit email code")).toHaveCount(0);
  await expect(page).toHaveURL(/mode=signin.*prefill=existing(?:%40|@)example(?:\.|%2E)com.*reason=account-exists/);
  await page.getByLabel("Dismiss account notice").click();
  await expect(page.getByText("An account already exists for this email. Please sign in instead.")).toHaveCount(0);
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

test("switching authentication modes keeps the card anchored", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/auth?mode=signin&prefill=layout%40example.com&intent=SERVICE", { waitUntil: "domcontentloaded" });

  const card = page.getByTestId("auth-card");
  const signInBox = await card.boundingBox();
  expect(signInBox).not.toBeNull();

  const createAccount = page.getByRole("button", { name: "Create account" });
  await createAccount.click();
  await expect(createAccount).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { name: "Create your OBAOL account" })).toBeVisible();
  await expect(page).toHaveURL(/\/auth\?mode=signup&role=associate&prefill=layout(?:%40|@)example(?:\.|%2E)com&intent=SERVICE/);
  const signUpBox = await card.boundingBox();
  expect(signUpBox).not.toBeNull();
  expect(Math.abs(signUpBox.y - signInBox.y)).toBeLessThanOrEqual(2);
  expect(Math.abs(signUpBox.x - signInBox.x)).toBeLessThanOrEqual(2);
  expect(Math.abs(signUpBox.width - signInBox.width)).toBeLessThanOrEqual(2);

  const signIn = page.getByRole("button", { name: "Sign in" });
  await signIn.click();
  await expect(signIn).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await expect(page).toHaveURL(/\/auth\?mode=signin&prefill=layout(?:%40|@)example(?:\.|%2E)com&intent=SERVICE/);
  const returnedBox = await card.boundingBox();
  expect(returnedBox).not.toBeNull();
  expect(Math.abs(returnedBox.y - signInBox.y)).toBeLessThanOrEqual(2);

  for (let index = 0; index < 3; index += 1) {
    await createAccount.click();
    await signIn.click();
  }
  const repeatedBox = await card.boundingBox();
  expect(repeatedBox).not.toBeNull();
  expect(Math.abs(repeatedBox.y - signInBox.y)).toBeLessThanOrEqual(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
