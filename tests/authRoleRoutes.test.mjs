import test from "node:test";
import assert from "node:assert/strict";
import { getPasswordResetRole, getSignInPathForRole } from "../src/utils/authRoleRoutes.ts";

test("admin password recovery preserves the Admin role and login route", () => {
  assert.equal(getPasswordResetRole("Admin"), "Admin");
  assert.equal(getPasswordResetRole("admin"), "Admin");
  assert.equal(getSignInPathForRole("Admin"), "/auth/admin");
});

test("operator and team password recovery use the Operator flow", () => {
  assert.equal(getPasswordResetRole("Operator"), "Operator");
  assert.equal(getPasswordResetRole("Team"), "Operator");
  assert.equal(getSignInPathForRole("Operator"), "/auth/operator");
  assert.equal(getSignInPathForRole("Team"), "/auth/operator");
});

test("associate and unknown public roles use the Associate flow", () => {
  assert.equal(getPasswordResetRole("Associate"), "Associate");
  assert.equal(getPasswordResetRole("Customer"), "Associate");
  assert.equal(getSignInPathForRole("Associate"), "/auth/associate");
});
