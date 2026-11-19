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
  const result = normalizeApiError({ response: { status: 409, data: { code: "ACCOUNT_CONFLICT", error: "Account conflict", errors: { email: "This email is already in use.", password: ["Too short.", "Try another password."] } } } });
  assert.equal(result.message, "Account conflict");
  assert.equal(result.code, "ACCOUNT_CONFLICT");
  assert.deepEqual(result.fieldErrors, { email: "This email is already in use.", password: "Too short. Try another password." });
});

test("normalizes ordinary and network failures with a caller fallback", () => {
  assert.equal(normalizeApiError(new Error("Unexpected failure"), "Fallback").message, "Unexpected failure");
  const networkFailure = normalizeApiError({ code: "ERR_NETWORK", message: "Network Error" }, "Fallback");
  assert.equal(networkFailure.message, "The approval service could not be reached. No decision was recorded; please retry shortly.");
  assert.equal(networkFailure.isRetryable, true);
  assert.equal(normalizeApiError({}, "Caller fallback").message, "Caller fallback");
});

test("preserves service error details and the support reference", () => {
  const result = normalizeApiError({
    response: {
      status: 409,
      headers: { "x-request-id": "req-123" },
      data: { code: "REVIEW_CONFLICT", message: "This request has already been reviewed." },
    },
  });

  assert.equal(result.message, "This request has already been reviewed.");
  assert.equal(result.code, "REVIEW_CONFLICT");
  assert.equal(result.requestId, "req-123");
  assert.equal(result.isRetryable, false);
});

test("classifies temporary gateway failures as retryable", () => {
  const result = normalizeApiError({ response: { status: 503, data: {} } });
  assert.equal(result.message, "The approval service is temporarily unavailable. No decision was recorded; please retry shortly.");
  assert.equal(result.isRetryable, true);
});
