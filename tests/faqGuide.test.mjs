import test from "node:test";
import assert from "node:assert/strict";
import { FAQ_CATEGORIES, FAQS, filterFaqs, generateFaqSchema } from "../src/app/faq/faqSchema.ts";

test("FAQ guide has a valid, unique, categorized canonical dataset", () => {
  assert.ok(FAQS.length >= 45 && FAQS.length <= 55, `expected 45-55 FAQs, found ${FAQS.length}`);
  assert.equal(new Set(FAQS.map((faq) => faq.id)).size, FAQS.length);
  const categoryIds = new Set(FAQ_CATEGORIES.map((category) => category.id));
  assert.equal(categoryIds.size, FAQ_CATEGORIES.length);
  for (const faq of FAQS) {
    assert.ok(categoryIds.has(faq.category), `unknown category for ${faq.id}`);
    assert.ok(faq.question.trim(), `missing question for ${faq.id}`);
    assert.ok(faq.answer.trim(), `missing answer for ${faq.id}`);
    assert.ok(faq.keywords.length, `missing keywords for ${faq.id}`);
    if (faq.relatedLink) {
      assert.match(faq.relatedLink.href, /^\/[a-z0-9\-/]*$/);
      assert.ok(faq.relatedLink.label.trim());
    }
  }
});

test("FAQ search covers questions, answers, category titles, and keywords", () => {
  assert.ok(filterFaqs(FAQS, "what is obaol supreme").some((faq) => faq.id === "what-is-obaol"));
  assert.ok(filterFaqs(FAQS, "custody").some((faq) => faq.id === "inventory-and-goods"));
  assert.ok(filterFaqs(FAQS, "documents and partner services").some((faq) => faq.category === "services"));
  assert.ok(filterFaqs(FAQS, "n8n").some((faq) => faq.id === "automation-builders"));
  assert.deepEqual(filterFaqs(FAQS, "definitely-no-match"), []);
});

test("FAQ category filtering and reset semantics are deterministic", () => {
  const riskFaqs = filterFaqs(FAQS, "", "risk");
  assert.ok(riskFaqs.length > 0);
  assert.ok(riskFaqs.every((faq) => faq.category === "risk"));
  assert.equal(filterFaqs(FAQS, "", "all").length, FAQS.length);
  assert.equal(filterFaqs(FAQS, "  ", "all").length, FAQS.length);
});

test("FAQ structured data contains every canonical answer", () => {
  const schema = generateFaqSchema();
  assert.equal(schema["@type"], "FAQPage");
  assert.equal(schema.mainEntity.length, FAQS.length);
  for (const [index, entity] of schema.mainEntity.entries()) {
    assert.equal(entity["@type"], "Question");
    assert.equal(entity.name, FAQS[index].question);
    assert.equal(entity.acceptedAnswer["@type"], "Answer");
    assert.equal(entity.acceptedAnswer.text, FAQS[index].answer);
  }
});
