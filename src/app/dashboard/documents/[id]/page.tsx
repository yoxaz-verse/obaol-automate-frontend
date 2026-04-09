"use client";

import React, { useContext, useEffect, useState } from "react";
import { Button, Card, CardBody, CardHeader, Input, Select, SelectItem, Textarea } from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";

import AuthContext from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { apiRoutes } from "@/core/api/apiRoutes";
import { getData, patchData } from "@/core/api/apiHandler";
import { showToastMessage } from "@/utils/utils";

const STATUS_OPTIONS = ["DRAFT", "SENT", "ACCEPTED", "REJECTED", "CANCELLED"];
const VERIFIED_OPTIONS = ["PENDING", "VERIFIED", "REJECTED"];

export default function DocumentDetailPage() {
  const params = useParams();
  const id = String(params?.id || "");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { formatRate } = useCurrency();
  const { user } = useContext(AuthContext);
  const roleLower = String(user?.role || "").toLowerCase();
  const canManage = roleLower === "admin" || roleLower === "operator" || roleLower === "team";

  const { data: docResponse } = useQuery({
    queryKey: ["trade-document", id],
    queryFn: () => getData(apiRoutes.tradeDocuments.getOne(id)),
    enabled: Boolean(id),
  });

  const doc = docResponse?.data?.data || null;

  const [status, setStatus] = useState("DRAFT");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [deliveryTerms, setDeliveryTerms] = useState("");
  const [notes, setNotes] = useState("");
  const [taxAmount, setTaxAmount] = useState("0");
  const [fileUrl, setFileUrl] = useState("");
  const [verifiedStatus, setVerifiedStatus] = useState("PENDING");

  useEffect(() => {
    if (!doc) return;
    setStatus(String(doc.status || "DRAFT"));
    setPaymentTerms(String(doc?.terms?.paymentTerms || ""));
    setDeliveryTerms(String(doc?.terms?.deliveryTerms || ""));
    setNotes(String(doc?.terms?.notes || ""));
    setTaxAmount(String(doc?.totals?.taxAmount ?? 0));
    setFileUrl(String(doc?.fileUrl || ""));
    setVerifiedStatus(String(doc?.verifiedStatus || "PENDING"));
  }, [doc]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      return patchData(apiRoutes.tradeDocuments.update(id), {
        status,
        fileUrl: fileUrl || null,
        verifiedStatus,
        terms: {
          paymentTerms,
          deliveryTerms,
          notes,
        },
        totals: {
          taxAmount: Number(taxAmount || 0),
        },
      });
    },
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Document updated.", position: "top-right" });
      queryClient.invalidateQueries({ queryKey: ["trade-document", id] });
      queryClient.invalidateQueries({ queryKey: ["trade-documents"] });
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || error?.message || "Failed to update document.",
        position: "top-right",
      });
    },
  });

  const lineItems = Array.isArray(doc?.lineItems) ? doc.lineItems : [];
  const totals = doc?.totals || {};

  const buyerLabel = doc?.buyer?.name || "Buyer";
  const docTypeLabel = doc?.type ? String(doc.type).replaceAll("_", " ") : "Invoice";
  const docDate = doc?.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "";
  const subtotal = Number(totals.subtotal || 0);
  const commissionTotal = Number(totals.commissionTotal || 0);
  const displayTax = canManage ? Number(taxAmount || 0) : Number(totals.taxAmount || 0);
  const displayGrandTotal = subtotal + commissionTotal + displayTax;

  return (
    <section className="print-sheet">
      <div className="mx-2 md:mx-6 mb-2 flex items-center justify-between gap-3 flex-wrap no-print">
        <Button variant="light" onPress={() => router.back()} startContent={<FiArrowLeft />}>
          Back
        </Button>
      </div>
      <div className="mx-2 md:mx-6 mb-6 flex items-center justify-between gap-3 flex-wrap no-print">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="OBAOL" className="h-10 w-auto" />
          <div>
            <div className="text-lg font-semibold">{docTypeLabel}</div>
            <div className="text-xs text-default-500">{doc?.documentNumber || ""}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="flat" onPress={() => window.print()}>Download PDF</Button>
          {canManage && (
            <Button color="primary" onPress={() => updateMutation.mutate()} isLoading={updateMutation.isPending}>
              Save Changes
            </Button>
          )}
          <span className="text-[10px] text-default-500">Disable browser headers/footers in print settings.</span>
        </div>
      </div>

      <div className="mx-2 md:mx-6 mb-6 border-b border-default-200/60 pb-4 print-header">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="OBAOL" className="h-12 w-auto" />
            <div>
              <div className="text-xl font-semibold uppercase tracking-wide">{docTypeLabel}</div>
              <div className="text-xs text-default-500">OBAOL Supreme</div>
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="font-semibold">{doc?.documentNumber || ""}</div>
            <div className="text-xs text-default-500">{docDate}</div>
            <div className="text-xs text-default-500">Status: {doc?.status || "DRAFT"}</div>
          </div>
        </div>
      </div>

      <div className="mx-2 md:mx-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="invoice-card">
            <CardHeader className="font-semibold">Bill To</CardHeader>
            <CardBody className="text-sm text-default-700">
              <div className="space-y-1">
                <div className="font-medium">{buyerLabel}</div>
                <div className="text-xs">{doc?.buyer?.email || ""}</div>
                <div className="text-xs">{doc?.buyer?.phone || ""}</div>
                <div className="text-xs">{doc?.buyer?.address || ""}</div>
              </div>
            </CardBody>
          </Card>

          <Card className="invoice-card">
            <CardHeader className="font-semibold">Line Items</CardHeader>
            <CardBody className="text-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="text-default-500 border-b border-default-200">
                    <tr>
                      <th className="text-left py-2">Product</th>
                      <th className="text-left py-2">Variant</th>
                      <th className="text-right py-2">Qty (MT)</th>
                      <th className="text-right py-2">Rate/KG</th>
                      <th className="text-right py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-default-200/60">
                        <td className="py-2">{item.productName || "-"}</td>
                        <td className="py-2">{item.productVariantName || "-"}</td>
                        <td className="py-2 text-right">{Number(item.quantityMT || 0).toFixed(2)}</td>
                        <td className="py-2 text-right">{formatRate(Number(item.ratePerKg || 0))}</td>
                        <td className="py-2 text-right">{formatRate(Number(item.amount || 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="invoice-card">
            <CardHeader className="font-semibold">Totals</CardHeader>
            <CardBody className="text-sm space-y-2">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatRate(subtotal)}</span></div>
              <div className="flex justify-between"><span>Commission</span><span>{formatRate(commissionTotal)}</span></div>
              <div className="flex justify-between items-center gap-2">
                <span>Tax</span>
                {canManage ? (
                  <Input
                    size="sm"
                    className="w-28"
                    value={taxAmount}
                    onChange={(e) => setTaxAmount(e.target.value)}
                  />
                ) : (
                  <span>{formatRate(displayTax)}</span>
                )}
              </div>
              <div className="flex justify-between font-semibold text-base"><span>Grand Total</span><span>{formatRate(displayGrandTotal)}</span></div>
            </CardBody>
          </Card>
          <Card className="invoice-card">
            <CardHeader className="font-semibold">Attachments</CardHeader>
            <CardBody className="text-sm space-y-3">
              {canManage ? (
                <Input
                  label="File URL"
                  placeholder="https://..."
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                />
              ) : (
                <div className="text-xs text-default-500">{fileUrl || "No file attached."}</div>
              )}
              {fileUrl && (
                <Button size="sm" variant="flat" onPress={() => window.open(fileUrl, "_blank")}>
                  Open File
                </Button>
              )}
              {canManage ? (
                <Select
                  label="Verification Status"
                  selectedKeys={[verifiedStatus]}
                  onSelectionChange={(keys) => setVerifiedStatus(String(Array.from(keys)[0] || "PENDING"))}
                >
                  {VERIFIED_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </Select>
              ) : (
                <div className="text-xs text-default-500">Verification: {verifiedStatus}</div>
              )}
            </CardBody>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="invoice-card">
            <CardHeader className="font-semibold">Terms & Notes</CardHeader>
            <CardBody className="text-sm space-y-4">
              {canManage ? (
                <>
                  <div className="no-print">
                    <Select label="Status" selectedKeys={[status]} onSelectionChange={(keys) => setStatus(String(Array.from(keys)[0] || "DRAFT"))}>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </Select>
                  </div>
                  <Textarea
                    label="Payment Terms"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    minRows={3}
                  />
                  <Textarea
                    label="Delivery Terms"
                    value={deliveryTerms}
                    onChange={(e) => setDeliveryTerms(e.target.value)}
                    minRows={3}
                  />
                  <Textarea
                    label="Additional Notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    minRows={4}
                  />
                </>
              ) : (
                <div className="space-y-2">
                  <div><span className="font-semibold">Payment Terms:</span> {doc?.terms?.paymentTerms || "-"}</div>
                  <div><span className="font-semibold">Delivery Terms:</span> {doc?.terms?.deliveryTerms || "-"}</div>
                  <div><span className="font-semibold">Notes:</span> {doc?.terms?.notes || "-"}</div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          [data-sidebar], [data-topbar], [data-bottomnav] { display: none !important; }
          section { padding: 0 !important; margin: 0 !important; }
          body { background: white !important; }
          @page { margin: 12mm; }
        }
        @media print {
          .print-header { margin-top: 0 !important; }
          .invoice-card { border: none !important; box-shadow: none !important; }
          .invoice-card > div { padding-left: 0 !important; padding-right: 0 !important; }
          table { border-collapse: collapse; }
          th, td { padding-top: 6px !important; padding-bottom: 6px !important; }
        }
      `}</style>
    </section>
  );
}
