"use client";

import React, { useMemo, useState } from "react";
import { Select, SelectItem, Button } from "@nextui-org/react";
import Title from "@/components/titles";
import DocumentTemplatePreview from "@/components/dashboard/Documents/DocumentTemplatePreview";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { extractList } from "@/core/data/queryUtils";

const DOC_TYPES = [
  "LOI",
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
  "LORRY_RECEIPT",
  "LCL_DRAFT",
  "INSURANCE_CERTIFICATE",
  "PAYMENT_ADVICE",
];

export default function DocumentationPreviewPage() {
  const [docType, setDocType] = useState<string>("QUOTATION");
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string>("");

  const enquiriesQuery = useQuery({
    queryKey: ["documentation-preview-enquiries"],
    queryFn: () => getData(apiRoutes.enquiry.getAll, { page: 1, limit: 200, sort: "createdAt:desc" }),
  });
  const enquiries = useMemo(() => extractList(enquiriesQuery.data), [enquiriesQuery.data]);

  const { data: selectedEnquiry } = useQuery({
    queryKey: ["documentation-preview-enquiry", selectedEnquiryId],
    queryFn: () => getData(`${apiRoutes.enquiry.getAll}/${selectedEnquiryId}`),
    select: (res) => res?.data?.data,
    enabled: Boolean(selectedEnquiryId),
  });

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
            <Select
              size="sm"
              selectedKeys={selectedEnquiryId ? [selectedEnquiryId] : []}
              onSelectionChange={(keys) => setSelectedEnquiryId(String(Array.from(keys)[0] || ""))}
              label="Enquiry"
              className="min-w-[260px]"
              placeholder="Select enquiry"
            >
              {enquiries.map((row: any) => {
                const id = row?._id || row?.id || "";
                const label = id ? `#${String(id).slice(-6).toUpperCase()}` : "Enquiry";
                const product = row?.productName || row?.productVariantName || row?.productVariant?.product?.name || row?.product?.name;
                return (
                  <SelectItem key={id} value={id}>
                    {product ? `${label} • ${product}` : label}
                  </SelectItem>
                );
              })}
            </Select>
            <div className="text-xs text-default-500">
              Select an enquiry to preview real data.
            </div>
          </div>
          <Button as={Link} href="/dashboard/documentation-rules" variant="flat" size="sm">
            Back to Rules
          </Button>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-[880px]">
            <div className="bg-white text-black shadow-2xl rounded-lg p-6 min-h-[1123px] border border-default-200">
              {selectedEnquiry ? (
                <DocumentTemplatePreview docType={docType} enquiry={selectedEnquiry} />
              ) : (
                <div className="h-full min-h-[1020px] flex items-center justify-center text-sm text-default-500">
                  Select an enquiry to preview real document data.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
