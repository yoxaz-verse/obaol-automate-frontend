import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

test("existing email signup redirects to the matching sign-in page with a trusted notice", () => {
  const login = read("../src/components/Login/login-component.tsx");

  assert.equal(login.includes('new URLSearchParams({ reason: "account-exists" })'), true);
  assert.equal(login.includes('redirectExistingAccountToSignIn(startError?.response?.data?.role, email)'), true);
  assert.equal(login.includes('redirectExistingAccountToSignIn(error?.response?.data?.role || roleValue)'), true);
  assert.equal(login.includes('setErrorMessage("Your account already exists. Please sign in.")'), true);
  assert.equal(login.includes('initialQuery.reason !== "account-exists"'), true);
  assert.equal(login.includes('aria-label="Dismiss account notice"'), true);
});

test("Associate and Operator sign-in pages pass only the redirect reason to the login UI", () => {
  const associatePage = read("../src/app/auth/associate/page.tsx");
  const operatorPage = read("../src/app/auth/operator/page.tsx");

  for (const page of [associatePage, operatorPage]) {
    assert.equal(page.includes("reason?: string | string[]"), true);
    assert.equal(page.includes("reason: firstValue(searchParams?.reason)"), true);
  }
});

test("staff fallback explains the redirect and carries the trusted reason into role sign-in", () => {
  const entry = read("../src/components/Auth/AuthEntry.tsx");

  assert.equal(entry.includes('reason === "account-exists"'), true);
  assert.equal(entry.includes("Your account already exists. Please choose the correct role and sign in."), true);
  assert.equal(entry.includes('params.set("reason", "account-exists")'), true);
});
