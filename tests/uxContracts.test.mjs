import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

test("the root viewport allows browser zoom", () => {
  const layout = read("../src/app/layout.tsx");
  assert.equal(layout.includes("userScalable: false"), false);
  assert.equal(layout.includes("maximumScale: 1"), false);
  assert.equal(layout.includes("Skip to main content"), true);
});

test("the public entry explains buyer, seller, and operator choices", () => {
  const entry = read("../src/components/Auth/AuthEntry.tsx");
  for (const phrase of ["I want to buy", "I want to sell", "I work in operations"]) assert.equal(entry.includes(phrase), true);
});

test("active homepage source does not advertise fabricated runtime telemetry", () => {
  const homepage = read("../src/components/home/HomeContent.tsx") + read("../src/components/home/herosection.tsx");
  for (const phrase of ["CORE_LATENCY", "AES-256", "SYS_LINK"]) assert.equal(homepage.includes(phrase), false);
});
