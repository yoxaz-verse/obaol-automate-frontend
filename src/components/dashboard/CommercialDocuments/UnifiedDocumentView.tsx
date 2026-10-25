"use client";
import React from "react";
import TemplateCanvasRenderer from "@/components/dashboard/Documents/TemplateCanvasRenderer";
import DocumentSheet from "./DocumentSheet";

export default function UnifiedDocumentView({ doc }: { doc: any }) {
  const layout = doc?.templateSnapshot?.layoutSchema;
  if (!layout) return <DocumentSheet doc={doc} />;
  return <div className="commercial-sheet mx-auto max-w-[900px]"><TemplateCanvasRenderer layoutSchema={layout} docLabel={String(doc.type || "Document").replaceAll("_", " ")} data={{ documentNumber: doc.number, docDate: doc.issueDate ? new Date(doc.issueDate).toLocaleDateString() : "-", buyer: doc.buyer || doc.recipient, seller: doc.seller || doc.issuer, lineItems: doc.lineItems, totals: doc.totals, terms: doc.terms, documentData: doc.documentData || {}, letterheadConfig: doc.templateSnapshot?.letterheadConfig || {}, manualInput: doc.documentData || {} }} /></div>;
}
