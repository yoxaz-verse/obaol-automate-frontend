import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

test("legacy signup routes use the same private existing-account redirect", () => {
  const login = read("../src/components/Login/login-component.tsx");

  assert.equal(login.includes('new URLSearchParams({ mode: "signin", reason: "account-exists" })'), true);
  assert.equal(login.includes('redirectExistingAccountToSignIn(email)'), true);
  assert.equal(login.includes('error?.response?.data?.code === "ACCOUNT_EXISTS"'), true);
  assert.equal(login.includes('router.push(`/auth?${params.toString()}`)'), true);
  assert.equal(login.includes("redirectExistingAccountToSignIn(startError?.response?.data?.role"), false);
  assert.equal(login.includes("redirectExistingAccountToSignIn(error?.response?.data?.role"), false);
  assert.equal(login.includes('setErrorMessage("Your account already exists. Please sign in.")'), true);
  assert.equal(login.includes('initialQuery.reason !== "account-exists"'), true);
  assert.equal(login.includes('aria-label="Dismiss account notice"'), true);
});

test("Associate and Operator sign-in pages redirect to the unified private flow", () => {
  const associatePage = read("../src/app/auth/associate/page.tsx");
  const operatorPage = read("../src/app/auth/operator/page.tsx");

  for (const page of [associatePage, operatorPage]) {
    assert.equal(page.includes('new URLSearchParams({ mode: "signin" })'), true);
    assert.equal(page.includes('redirect(`/auth?${params.toString()}`)'), true);
    assert.equal(page.includes("searchParams?.reason"), false);
  }
});

test("the unified flow does not call the account-enumerating email status endpoint", () => {
  const unified = read("../src/components/Auth/UnifiedAuthFlow.tsx");
  const authUtils = read("../src/utils/unifiedAuth.ts");
  assert.equal(unified.includes("/auth/email-status"), false);
  assert.equal(unified.includes("/auth/unified/password"), true);
  assert.equal(unified.includes("/verification/send-otp-existing"), true);
  assert.equal(unified.includes('error?.response?.data?.code === "ACCOUNT_EXISTS"'), true);
  assert.equal(unified.includes('setMode("signin")'), true);
  assert.equal(unified.includes('setStage("email")'), true);
  assert.equal(unified.includes('reason: "account-exists"'), true);
  assert.equal(unified.includes('aria-label="Dismiss account notice"'), true);
  assert.equal(authUtils.includes('ACCOUNT_EXISTS: "An account already exists for this email. Please sign in instead."'), true);
});

test("staff fallback explains the redirect and carries the trusted reason into role sign-in", () => {
  const entry = read("../src/components/Auth/AuthEntry.tsx");

  assert.equal(entry.includes('reason === "account-exists"'), true);
  assert.equal(entry.includes("Your account already exists. Please choose the correct role and sign in."), true);
  assert.equal(entry.includes('params.set("reason", "account-exists")'), true);
});
