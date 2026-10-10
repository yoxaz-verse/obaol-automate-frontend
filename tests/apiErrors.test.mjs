import test from "node:test";
import assert from "node:assert/strict";
import { normalizeApiError } from "../src/core/api/apiErrors.ts";

test("normalizes API messages without replacing backend content", () => {
  const result = normalizeApiError({ response: { status: 400, data: { message: "Name, a valid email, and a password of at least 8 characters are required." } } });
  assert.equal(result.message, "Name, a valid email, and a password of at least 8 characters are required.");
  assert.equal(result.status, 400);
  assert.deepEqual(result.fieldErrors, {});
});

test("normalizes alternate API errors and structured field messages", () => {
  const result = normalizeApiError({ response: { status: 409, data: { error: "Account conflict", errors: { email: "This email is already in use.", password: ["Too short.", "Try another password."] } } } });
  assert.equal(result.message, "Account conflict");
  assert.deepEqual(result.fieldErrors, { email: "This email is already in use.", password: "Too short. Try another password." });
});

test("normalizes ordinary and network failures with a caller fallback", () => {
  assert.equal(normalizeApiError(new Error("Unexpected failure"), "Fallback").message, "Unexpected failure");
  assert.equal(normalizeApiError({ code: "ERR_NETWORK", message: "Network Error" }, "Fallback").message, "Could not reach the server. Check your connection and try again.");
  assert.equal(normalizeApiError({}, "Caller fallback").message, "Caller fallback");
});
