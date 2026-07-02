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

test("the public entry clearly separates Associate and Operator accounts", () => {
  const entry = read("../src/components/Auth/AuthEntry.tsx");
  for (const phrase of [
    "I represent an industry business",
    "I want to become an OBAOL Operator",
    "Registered company required",
    "not an internal operations or employee login",
  ]) assert.equal(entry.includes(phrase), true);
  for (const phrase of ["I want to buy", "I want to sell", "I work in operations"]) assert.equal(entry.includes(phrase), false);
});

test("active homepage source does not advertise fabricated runtime telemetry", () => {
  const homepage = read("../src/components/home/HomeContent.tsx") + read("../src/components/home/herosection.tsx");
  for (const phrase of ["CORE_LATENCY", "AES-256", "SYS_LINK"]) assert.equal(homepage.includes(phrase), false);
});

test("the public commodity experience uses concise Catalog naming", () => {
  const header = read("../src/components/home/header.tsx");
  const footer = read("../src/components/home/footer.tsx");
  const directory = read("../src/app/product/page.tsx");
  const middleware = read("../src/middleware.ts");
  assert.equal(header.includes('label: "Catalog"'), true);
  assert.equal(footer.includes('name: "Catalog"'), true);
  assert.equal(directory.includes("Commodity"), true);
  assert.equal(directory.includes(">Catalog<"), true);
  assert.equal(directory.includes('placeholder="Search commodities"'), true);
  assert.equal(directory.includes("No commodities available"), true);
  assert.equal(directory.includes("OBAOL does not own or sell these commodities"), true);
  assert.equal(directory.includes("/api/trade-directory"), true);
  assert.equal(middleware.includes("/trade-directory${suffix}"), true);
  for (const phrase of ["Associate Trade Directory", "Associate-traded", "Associate coverage"]) {
    assert.equal((header + footer + directory).includes(phrase), false);
  }
});

test("dashboard discovery uses Trade Listings terminology", () => {
  const access = read("../src/utils/dashboardAccess.ts");
  const discovery = read("../src/app/dashboard/marketplace/page.tsx");
  assert.equal(access.includes('label: "Trade Listings"'), true);
  assert.equal(access.includes('label: "My Trade Listings"'), true);
  assert.equal(access.includes('label: "Commodity Directory"'), true);
  assert.equal(discovery.includes("Trade Listing Discovery"), true);
  assert.equal(discovery.includes('aria-label="Trade listing status"'), true);
});
