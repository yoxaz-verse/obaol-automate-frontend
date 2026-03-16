"use client";

import React, { useState } from "react";
import { Select, SelectItem, Button } from "@nextui-org/react";
import Title from "@/components/titles";
import DocumentTemplatePreview from "@/components/dashboard/Documents/DocumentTemplatePreview";
import Link from "next/link";

const DOC_TYPES = [
  "QUOTATION",
  "PROFORMA_INVOICE",
  "INVOICE",
  "PURCHASE_ORDER",
  "SALES_CONTRACT",
  "PACKING_LIST",
  "QUALITY_CERTIFICATE",
  "INSPECTION_CERTIFICATE",
  "PHYTOSANITARY_CERTIFICATE",
  "FUMIGATION_CERTIFICATE",
  "BILL_OF_LADING",
  "AIR_WAYBILL",
  "INSURANCE_CERTIFICATE",
  "PAYMENT_ADVICE",
];

export default function DocumentationPreviewPage() {
  const [docType, setDocType] = useState<string>("QUOTATION");

  return (
    <section className="">
      <Title title="Documentation Preview" />

      <div className="mx-2 md:mx-6 mb-4 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Select
              size="sm"
              selectedKeys={[docType]}
              onSelectionChange={(keys) => setDocType(String(Array.from(keys)[0] || "QUOTATION"))}
              label="Document Type"
              className="min-w-[220px]"
            >
              {DOC_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </Select>
            <div className="text-xs text-default-500">
              A4 print preview with placeholder data.
            </div>
          </div>
          <Button as={Link} href="/dashboard/documentation-rules" variant="flat" size="sm">
            Back to Rules
          </Button>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-[880px]">
            <div className="bg-white text-black shadow-2xl rounded-lg p-6 min-h-[1123px] border border-default-200">
              <DocumentTemplatePreview docType={docType} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
