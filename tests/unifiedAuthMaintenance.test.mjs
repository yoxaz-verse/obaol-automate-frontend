import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  AUTH_SERVICE_UPGRADE_MESSAGE,
  normalizeAuthError,
} from "../src/utils/unifiedAuth.ts";

const maintenanceStatus = {
  tone: "maintenance",
  code: "SERVICE_UPGRADE",
  message: AUTH_SERVICE_UPGRADE_MESSAGE,
};

test("network and timeout failures use the service upgrade message", () => {
  assert.deepEqual(normalizeAuthError({ code: "ERR_NETWORK", message: "Network Error" }), maintenanceStatus);
  assert.deepEqual(normalizeAuthError({ code: "ECONNABORTED", message: "timeout exceeded" }), maintenanceStatus);
  assert.deepEqual(normalizeAuthError({ code: "ETIMEDOUT", message: "request timed out" }), maintenanceStatus);
});

for (const status of [502, 503, 504]) {
  test(`${status} responses use the service upgrade message`, () => {
    assert.deepEqual(normalizeAuthError({ response: { status, data: {} } }), maintenanceStatus);
  });
}

test("AUTH_UNAVAILABLE uses the service upgrade message", () => {
  assert.deepEqual(
    normalizeAuthError({ response: { status: 503, data: { code: "AUTH_UNAVAILABLE" } } }),
    maintenanceStatus
  );
});

test("reachable auth failures retain their specific error treatment", () => {
  assert.deepEqual(
    normalizeAuthError({ response: { status: 401, data: { code: "INVALID_CREDENTIALS" } } }),
    { tone: "error", code: "INVALID_CREDENTIALS", message: "The email or password is incorrect." }
  );
  assert.deepEqual(
    normalizeAuthError({ response: { status: 400, data: { code: "OTP_EXPIRED" } } }),
    { tone: "error", code: "OTP_EXPIRED", message: "That verification code is invalid or has expired. Request a new code and try again." }
  );
  assert.equal(normalizeAuthError({ response: { status: 429, data: { code: "RATE_LIMITED" } } }).tone, "error");
});

test("unified auth renders maintenance as an accessible amber status", () => {
  const source = readFileSync(
    fileURLToPath(new URL("../src/components/Auth/UnifiedAuthFlow.tsx", import.meta.url)),
    "utf8"
  );
  assert.match(source, /status\.tone === "maintenance"/);
  assert.match(source, /border-amber-300 bg-amber-50/);
  assert.match(source, /<FiTool/);
  assert.match(source, /role=\{status\?\.tone === "error" \? "alert" : "status"\}/);
});
