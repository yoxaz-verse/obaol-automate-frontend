import test from "node:test";
import assert from "node:assert/strict";
import { detectOffPlatformDisclosure } from "../src/utils/offPlatformDisclosure.ts";

const detect = (value, companyNames = []) => detectOffPlatformDisclosure(value, { companyNames });

test("allows legitimate trade specifications and logistics text", () => {
  for (const value of ["", "6-7mm", "Grade 1", "10% moisture", "2 x 25 kg bags", "Deliver on 16 Oct 2026", "Route through INNSA port", "Use food-grade bags"]) {
    assert.equal(detect(value), null, value);
  }
});

test("detects digit, word-form, mixed, and repeated-word phone numbers", () => {
  for (const value of ["+91 70282 55569", "702-825-5569", "７０２８２５５５６９", "seven zero two eight two triple five six nine", "91 seven zero two 825 five five six nine"]) {
    assert.equal(detect(value)?.kind, "phone", value);
  }
});

test("detects normal and obfuscated email and website details", () => {
  assert.equal(detect("business@example.com")?.kind, "email");
  assert.equal(detect("business at example dot com")?.kind, "email");
  assert.equal(detect("https://example.com/contact")?.kind, "website");
  assert.equal(detect("Visit example.com")?.kind, "website");
  assert.equal(detect("example dot com")?.kind, "website");
});

test("detects social and messaging contact details", () => {
  assert.equal(detect("Telegram me at @trade_user")?.kind, "social_handle");
  assert.equal(detect("@trade_user")?.kind, "social_handle");
  assert.equal(detect("contact me via Signal")?.kind, "social_handle");
});

test("detects registered company variants without partial-word matches", () => {
  const names = ["Acme Foods Private Limited", "Acme Exports"];
  assert.equal(detect("We are Acme Foods Pvt. Ltd.", names)?.kind, "company_name");
  assert.equal(detect("Contact ACME FOODS directly", names)?.kind, "company_name");
  assert.equal(detect("Use acme-grade packaging", names), null);
});
