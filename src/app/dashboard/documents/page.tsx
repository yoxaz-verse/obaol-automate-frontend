"use client";

import React, { useContext, useMemo, useState } from "react";
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Tab, Tabs } from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import AuthContext from "@/context/AuthContext";
import Title from "@/components/titles";
import { apiRoutes } from "@/core/api/apiRoutes";
import { getData, postData } from "@/core/api/apiHandler";
import { showToastMessage } from "@/utils/utils";

const TYPE_TABS = [
  { key: "ALL", label: "All" },
  { key: "QUOTATION", label: "Quotations" },
  { key: "PROFORMA_INVOICE", label: "Proforma" },
  { key: "INVOICE", label: "Invoices" },
  { key: "PURCHASE_ORDER", label: "Purchase Orders" },
  { key: "SALES_CONTRACT", label: "Sales Contract" },
  { key: "PACKING_LIST", label: "Packing List" },
  { key: "QUALITY_CERTIFICATE", label: "Quality Certificate" },
  { key: "INSPECTION_CERTIFICATE", label: "Inspection Certificate" },
  { key: "PHYTOSANITARY_CERTIFICATE", label: "Phytosanitary Certificate" },
  { key: "FUMIGATION_CERTIFICATE", label: "Fumigation Certificate" },
  { key: "BILL_OF_LADING", label: "Bill of Lading" },
  { key: "AIR_WAYBILL", label: "Air Waybill" },
  { key: "INSURANCE_CERTIFICATE", label: "Insurance Certificate" },
  { key: "PAYMENT_ADVICE", label: "Payment Advice" },
];

const STATUS_OPTIONS = ["ALL", "DRAFT", "SENT", "ACCEPTED", "REJECTED", "CANCELLED"];
const STAGE_TYPES = ["INQUIRY", "ORDER"];
const INQUIRY_STAGES = ["INQUIRY_CREATED", "QUOTATION_SUBMITTED", "QUOTATION_REVISED", "PROFORMA_ISSUED", "PURCHASE_ORDER_RECEIVED", "ORDER_CONFIRMED"];
const ORDER_STAGES = ["ORDER_CREATED", "CONTRACT_SIGNED", "PRODUCTION_STARTED", "QUALITY_VERIFIED", "COMPLIANCE_APPROVED", "PACKING_COMPLETED", "READY_FOR_SHIPMENT", "SHIPPED", "DELIVERED", "PAYMENT_PENDING", "PAYMENT_COMPLETED", "TRADE_CLOSED"];

export default function DocumentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  const roleLower = String(user?.role || "").toLowerCase();
  const canManage = roleLower === "admin" || roleLower === "operator" || roleLower === "team";

  const [typeTab, setTypeTab] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [companyFilter, setCompanyFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createType, setCreateType] = useState("QUOTATION");
  const [createEnquiryId, setCreateEnquiryId] = useState("");
  const [createOrderId, setCreateOrderId] = useState("");
  const [createFileUrl, setCreateFileUrl] = useState("");
  const [createMode, setCreateMode] = useState<"CREATE" | "UPLOAD">("CREATE");
  const [createError, setCreateError] = useState("");
  const [ruleStageType, setRuleStageType] = useState("ORDER");
  const [ruleStageKey, setRuleStageKey] = useState("ORDER_CREATED");

  const { data: docsResponse } = useQuery({
    queryKey: ["trade-documents", typeTab, statusFilter, companyFilter],
    queryFn: () =>
      getData(apiRoutes.tradeDocuments.list, {
        page: 1,
        limit: 200,
        ...(typeTab !== "ALL" && { type: typeTab }),
        ...(statusFilter !== "ALL" && { status: statusFilter }),
        ...(companyFilter && { companyId: companyFilter }),
      }),
  });

  const documents = Array.isArray(docsResponse?.data?.data?.data)
    ? docsResponse?.data?.data?.data
    : (docsResponse?.data?.data || []);

  const { data: rulesResponse } = useQuery({
    queryKey: ["document-rules"],
    queryFn: () => getData(apiRoutes.documentRules.list),
  });
  const rules = Array.isArray(rulesResponse?.data?.data) ? rulesResponse.data.data : [];
  const stageOptions = ruleStageType === "INQUIRY" ? INQUIRY_STAGES : ORDER_STAGES;
  const stageRules = rules
    .filter((r: any) => String(r.stageType) === ruleStageType && String(r.stageKey) === ruleStageKey && r.isActive !== false)
    .sort((a: any, b: any) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));

  const { data: companiesResponse } = useQuery({
    queryKey: ["doc-companies"],
    queryFn: () => getData(apiRoutes.associateCompany.getAll, { page: 1, limit: 1000 }),
    enabled: canManage,
  });

  const companies = Array.isArray(companiesResponse?.data?.data?.data)
    ? companiesResponse?.data?.data?.data
    : (companiesResponse?.data?.data || []);

  const filteredDocs = useMemo(() => {
    if (!search.trim()) return documents;
    const needle = search.toLowerCase();
    return (documents || []).filter((doc: any) => {
      const seller = doc?.seller?.name || "";
      const buyer = doc?.buyer?.name || "";
      const docNum = doc?.documentNumber || "";
      return [seller, buyer, docNum].some((val) => String(val || "").toLowerCase().includes(needle));
    });
  }, [documents, search]);

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!createEnquiryId && !createOrderId) {
        throw new Error("Enquiry ID or Order ID is required.");
      }
      return postData(apiRoutes.tradeDocuments.create, {
        type: createType,
        enquiryId: createEnquiryId || undefined,
        orderId: createOrderId || undefined,
        fileUrl: createMode === "UPLOAD" ? (createFileUrl || null) : undefined,
      });
    },
    onSuccess: (res: any) => {
      showToastMessage({ type: "success", message: "Document created.", position: "top-right" });
      setCreateOpen(false);
      setCreateEnquiryId("");
      setCreateOrderId("");
      setCreateFileUrl("");
      setCreateError("");
      queryClient.invalidateQueries({ queryKey: ["trade-documents"] });
      const id = res?.data?.data?._id;
      if (id) router.push(`/dashboard/documents/${id}`);
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || error?.message || "Failed to create document.",
        position: "top-right",
      });
    },
  });

  const handleCreateDocument = () => {
    if (!createEnquiryId && !createOrderId) {
      const message = "Enquiry ID or Order ID is required.";
      setCreateError(message);
      showToastMessage({ type: "error", message, position: "top-right" });
      return;
    }
    if (createMode === "UPLOAD" && !createFileUrl.trim()) {
      const message = "File URL is required for upload documents.";
      setCreateError(message);
      showToastMessage({ type: "error", message, position: "top-right" });
      return;
    }
    setCreateError("");
    createMutation.mutate();
  };

  return (
    <section className="">
      <Title title="Documents" />

      <div className="mx-2 md:mx-6 mb-4 flex flex-col gap-4">
        <div className="rounded-xl border border-default-200/70 bg-content1/95 p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
            <div className="font-semibold">Required Documents (by stage)</div>
            <div className="flex gap-3 flex-wrap">
              <Select
                className="w-40"
                label="Stage Type"
                selectedKeys={[ruleStageType]}
                onSelectionChange={(keys) => {
                  const next = String(Array.from(keys)[0] || "ORDER");
                  setRuleStageType(next);
                  setRuleStageKey(next === "INQUIRY" ? "INQUIRY_CREATED" : "ORDER_CREATED");
                }}
              >
                {STAGE_TYPES.map((t) => (<SelectItem key={t}>{t}</SelectItem>))}
              </Select>
              <Select
                className="w-56"
                label="Stage"
                selectedKeys={[ruleStageKey]}
                onSelectionChange={(keys) => setRuleStageKey(String(Array.from(keys)[0] || ""))}
              >
                {stageOptions.map((t) => (<SelectItem key={t}>{t}</SelectItem>))}
              </Select>
            </div>
          </div>
          {stageRules.length === 0 ? (
            <div className="text-sm text-default-500">No rules configured for this stage.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {stageRules.map((rule: any) => (
                <div key={rule._id} className="flex items-center justify-between gap-3 border border-default-200/60 rounded-lg px-3 py-2">
                  <div className="text-sm">
                    <span className="font-medium">{rule.docType}</span>
                    <span className="text-default-500"> • {rule.responsibleRole} • {rule.actionType} • {rule.visibility}</span>
                  </div>
                  {canManage && (
                    <Button
                      size="sm"
                      variant="flat"
                      onPress={() => {
                        setCreateMode(rule.actionType === "UPLOAD" ? "UPLOAD" : "CREATE");
                        setCreateType(rule.docType);
                        setCreateOpen(true);
                      }}
                    >
                      {rule.actionType === "UPLOAD" ? "Upload" : "Create"}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Tabs
            selectedKey={typeTab}
            onSelectionChange={(key) => setTypeTab(String(key))}
            variant="underlined"
            classNames={{
              tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-primary h-[2px]",
              tab: "max-w-fit px-0 h-10",
              tabContent: "group-data-[selected=true]:text-primary font-black uppercase tracking-widest text-[10px] opacity-70 group-data-[selected=true]:opacity-100",
            }}
          >
            {TYPE_TABS.map((tab) => (
              <Tab key={tab.key} title={tab.label} />
            ))}
          </Tabs>
          {canManage && (
            <Button color="primary" onPress={() => setCreateOpen(true)}>
              Create Document
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <Input
            className="w-full md:w-80"
            placeholder="Search document number or company"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            className="w-48"
            label="Status"
            selectedKeys={[statusFilter]}
            onSelectionChange={(keys) => setStatusFilter(String(Array.from(keys)[0] || "ALL"))}
          >
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </Select>
          {canManage && (
            <Select
              className="w-64"
              label="Company"
              selectedKeys={companyFilter ? [companyFilter] : []}
              onSelectionChange={(keys) => setCompanyFilter(String(Array.from(keys)[0] || ""))}
            >
              {companies.map((company: any) => (
                <SelectItem key={company._id} value={company._id}>
                  {company.name}
                </SelectItem>
              ))}
            </Select>
          )}
        </div>

        <div className="rounded-xl border border-default-200/70 bg-content1/95 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-default-500 border-b border-default-200/60">
              <tr>
                <th className="text-left px-4 py-3">Document</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Company</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-default-500">
                    No documents found.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc: any, idx: number) => (
                  <tr
                    key={doc._id}
                    className={`border-t border-default-200/60 ${idx % 2 ? "bg-default-50/30 dark:bg-default-100/5" : ""} cursor-pointer hover:bg-default-100/30`}
                    onClick={() => router.push(`/dashboard/documents/${doc._id}`)}
                  >
                    <td className="px-4 py-3 font-medium">{doc.documentNumber}</td>
                    <td className="px-4 py-3">{doc.type?.replaceAll("_", " ")}</td>
                    <td className="px-4 py-3">{doc?.seller?.name || "-"}</td>
                    <td className="px-4 py-3">₹ {Number(doc?.totals?.grandTotal || 0).toFixed(2)}</td>
                    <td className="px-4 py-3">{doc.status}</td>
                    <td className="px-4 py-3">{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) setCreateError("");
        }}
        isDismissable={false}
        isKeyboardDismissDisabled
      >
        <ModalContent>
          <ModalHeader>Create Document</ModalHeader>
          <ModalBody>
            <Select
              label="Document Type"
              selectedKeys={[createType]}
              onSelectionChange={(keys) => setCreateType(String(Array.from(keys)[0] || "QUOTATION"))}
            >
              {TYPE_TABS.filter((t) => t.key !== "ALL").map((tab) => (
                <SelectItem key={tab.key} value={tab.key}>
                  {tab.label}
                </SelectItem>
              ))}
            </Select>
            <Select
              label="Action Type"
              selectedKeys={[createMode]}
              onSelectionChange={(keys) => setCreateMode((String(Array.from(keys)[0] || "CREATE") as "CREATE" | "UPLOAD"))}
            >
              <SelectItem key="CREATE">CREATE</SelectItem>
              <SelectItem key="UPLOAD">UPLOAD</SelectItem>
            </Select>
            {createMode === "UPLOAD" && (
              <Input
                label="File URL"
                placeholder="https://..."
                value={createFileUrl}
                onChange={(e) => setCreateFileUrl(e.target.value)}
              />
            )}
            <Input
              label="Enquiry ID"
              placeholder="Optional if Order ID is provided"
              value={createEnquiryId}
              onChange={(e) => setCreateEnquiryId(e.target.value)}
            />
            <Input
              label="Order ID"
              placeholder="Optional if Enquiry ID is provided"
              value={createOrderId}
              onChange={(e) => setCreateOrderId(e.target.value)}
            />
            {createError ? <div className="text-xs text-danger">{createError}</div> : null}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setCreateOpen(false)} isDisabled={createMutation.isPending}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleCreateDocument}
              isLoading={createMutation.isPending}
              isDisabled={createMutation.isPending}
            >
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </section>
  );
}
