import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const enquiryPage = readFileSync(
  new URL("../src/app/dashboard/enquiries/[id]/page.tsx", import.meta.url),
  "utf8"
);
const apiHandler = readFileSync(
  new URL("../src/core/api/apiHandler.tsx", import.meta.url),
  "utf8"
);

test("quotation creation immediately populates both enquiry document caches", () => {
  assert.match(enquiryPage, /cacheCreatedQuotation\(createdDocuments\)/);
  assert.match(enquiryPage, /mergeDocumentsIntoQueryCache\(\["trade-documents", enquiryId\], quotationDocuments\)/);
  assert.match(enquiryPage, /mergeDocumentsIntoQueryCache\(\["trade-documents", "enquiry", enquiryId\], documents\)/);
  assert.match(enquiryPage, /res\?\.data\?\.documents/);
});

test("an existing quotation changes the stage action into a viewer", () => {
  assert.match(enquiryPage, /QUOTATION_CREATED: quotationId \? "View Quotation" : "Create Quotation"/);
  assert.match(enquiryPage, /if \(quotationId && quotationDoc\)/);
  assert.match(enquiryPage, /openDocViewer\(quotationDoc\)/);
});

test("draft quotations remain visible before the issued milestone", () => {
  assert.match(enquiryPage, /const filteredEnquiryDocs = enquiryDocs \|\| \[\]/);
  assert.doesNotMatch(enquiryPage, /status === "DRAFT" && !showDraftQuotation/);
});

test("quotation creation uses a cancellable request timeout and reconciles ambiguous failures", () => {
  assert.match(apiHandler, /type PostDataOptions/);
  assert.match(apiHandler, /signal: options\.signal/);
  assert.match(apiHandler, /timeout: options\.timeoutMs/);
  assert.match(enquiryPage, /\{ timeoutMs: 15000 \}/);
  assert.doesNotMatch(enquiryPage, /Promise\.race\(\[request, timeout\]\)/);
  assert.match(enquiryPage, /const reconciled = await reconcileCreatedQuotation\(\)/);
});
