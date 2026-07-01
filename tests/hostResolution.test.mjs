import test from "node:test";
import assert from "node:assert/strict";
import { normalizeRequestHost, resolveRequestHost } from "../src/utils/hostResolution.ts";

test("local hosts always resolve to the main platform", () => {
  for (const host of ["localhost:3000", "127.0.0.1:3000", "[::1]:3000", "dev.local:3000"]) {
    assert.deepEqual(resolveRequestHost(host), { kind: "platform" });
  }
});

test("ports are removed before host routing", () => {
  assert.equal(normalizeRequestHost("Buyer.obaol.com:443"), "buyer.obaol.com");
});

test("brand and custom domains resolve without leaking unsafe path text", () => {
  assert.deepEqual(resolveRequestHost("buyer.obaol.com"), { kind: "subdomain-brand", slug: "buyer" });
  assert.deepEqual(resolveRequestHost("trade.example.com"), { kind: "custom-domain-brand", slug: "trade.example.com" });
  assert.deepEqual(resolveRequestHost("bad host"), { kind: "fallback", reason: "invalid" });
});
