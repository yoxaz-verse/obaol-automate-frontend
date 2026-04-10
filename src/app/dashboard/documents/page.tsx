"use client";

import React, { useContext, useMemo, useState } from "react";
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Tab, Tabs } from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import AuthContext from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import Title from "@/components/titles";
import { apiRoutes } from "@/core/api/apiRoutes";
import { getData, postData } from "@/core/api/apiHandler";
import { DEFAULT_STALE_TIME, extractList, useDocuments } from "@/core/data";
import { showToastMessage } from "@/utils/utils";

const TYPE_TABS = [
  { key: "ALL", label: "All Documents" },
  { key: "LOI", label: "LOI" },
  { key: "QUOTATION", label: "Quotations" },
  { key: "PROFORMA_INVOICE", label: "Proforma Invoice" },
  { key: "INVOICE", label: "Invoice History" },
  { key: "PURCHASE_ORDER", label: "Purchase Orders" },
  { key: "SALES_CONTRACT", label: "Sales Contract" },
  { key: "PACKING_LIST", label: "Packing List" },
  { key: "QUALITY_CERTIFICATE", label: "Quality Audit" },
  { key: "INSPECTION_CERTIFICATE", label: "Inspection Docs" },
  { key: "PHYTOSANITARY_CERTIFICATE", label: "Phytosanitary" },
  { key: "FUMIGATION_CERTIFICATE", label: "Fumigation" },
  { key: "BILL_OF_LADING", label: "Bill of Lading" },
  { key: "AIR_WAYBILL", label: "Air Waybill" },
  { key: "LORRY_RECEIPT", label: "Lorry Receipt" },
  { key: "LCL_DRAFT", label: "LCL Draft" },
  { key: "INSURANCE_CERTIFICATE", label: "Insurance" },
  { key: "PAYMENT_ADVICE", label: "Payment Advice" },
];

const STATUS_OPTIONS = ["ALL", "DRAFT", "SENT", "ACCEPTED", "REJECTED", "CANCELLED"];
const STAGE_TYPES = ["INQUIRY", "ORDER"];
const INQUIRY_STAGES = [
  "ENQUIRY_CREATED",
  "LOI_ACCEPTED_QTY_CONFIRMED",
  "QUOTATION_REVISION",
  "QUOTATION_CREATED",
  "QUOTATION_DECISION",
  "RESPONSIBILITIES_FINALIZED",
  "PROFORMA_ISSUED",
  "OTHER_DOCUMENTS",
  "PURCHASE_ORDER_CREATED",
];
const ORDER_STAGES = ["ORDER_CREATED", "CONTRACT_SIGNED", "PRODUCTION_STARTED", "QUALITY_VERIFIED", "COMPLIANCE_APPROVED", "PACKING_COMPLETED", "READY_FOR_SHIPMENT", "SHIPPED", "DELIVERED", "PAYMENT_PENDING", "PAYMENT_COMPLETED", "TRADE_CLOSED"];

export default function DocumentsPage() {
  const router = useRouter();
  const { formatRate } = useCurrency();
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

  const { data: docsResponse } = useDocuments({
    page: 1,
    limit: 20,
    ...(typeTab !== "ALL" && { type: typeTab }),
    ...(statusFilter !== "ALL" && { status: statusFilter }),
    ...(companyFilter && { companyId: companyFilter }),
  });

  const documents = docsResponse?.list ?? extractList(docsResponse?.raw ?? docsResponse);

  const { data: rulesResponse } = useQuery({
    queryKey: ["document-rules"],
    queryFn: () => getData(apiRoutes.documentRules.list),
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });
  const rules = extractList(rulesResponse?.data);
  const stageOptions = ruleStageType === "INQUIRY" ? INQUIRY_STAGES : ORDER_STAGES;
  const stageRules = rules
    .filter((r: any) => String(r.stageType) === ruleStageType && String(r.stageKey) === ruleStageKey && r.isActive !== false)
    .sort((a: any, b: any) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));

  const { data: companiesResponse } = useQuery({
    queryKey: ["doc-companies"],
    queryFn: () => getData(apiRoutes.associateCompany.getAll, { page: 1, limit: 200 }),
    enabled: canManage,
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const companies = extractList(companiesResponse?.data);

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

      <div className="mx-4 md:mx-10 mb-10 flex flex-col gap-8">
        <div className="rounded-[2rem] border border-foreground/5 bg-foreground/[0.02] backdrop-blur-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between gap-6 flex-wrap mb-6">
            <div className="flex flex-col gap-1">
               <h3 className="text-xl font-bold text-foreground">Compliance Gateway</h3>
               <p className="text-[10px] font-semibold text-default-400 uppercase tracking-widest opacity-60">Required documentation by trade stage.</p>
            </div>
            <div className="flex gap-4 flex-wrap">
              <Select
                className="w-40"
                variant="flat"
                classNames={{ trigger: "h-11 rounded-xl bg-foreground/5 border-none" }}
                label="Process Stream"
                selectedKeys={[ruleStageType]}
                onSelectionChange={(keys) => {
                  const next = String(Array.from(keys)[0] || "ORDER");
                  setRuleStageType(next);
                  setRuleStageKey(next === "INQUIRY" ? "ENQUIRY_CREATED" : "ORDER_CREATED");
                }}
              >
                {STAGE_TYPES.map((t) => (<SelectItem key={t} className="capitalize text-foreground">{t.toLowerCase()}</SelectItem>))}
              </Select>
              <Select
                className="w-56"
                variant="flat"
                classNames={{ trigger: "h-11 rounded-xl bg-foreground/5 border-none" }}
                label="Operation Phase"
                selectedKeys={[ruleStageKey]}
                onSelectionChange={(keys) => setRuleStageKey(String(Array.from(keys)[0] || ""))}
              >
                {stageOptions.map((t) => (<SelectItem key={t} className="capitalize text-foreground">{t.toLowerCase().replace(/_/g, " ")}</SelectItem>))}
              </Select>
            </div>
          </div>
          {stageRules.length === 0 ? (
            <div className="text-xs font-medium text-default-400 bg-foreground/[0.01] rounded-2xl p-8 border border-dashed border-foreground/10 text-center">No rules configured for this operational phase.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stageRules.map((rule: any) => (
                <div key={rule._id} className="flex items-center justify-between gap-4 border border-foreground/5 rounded-2xl px-5 py-4 bg-foreground/[0.01] hover:bg-foreground/[0.03] transition-colors">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-foreground uppercase tracking-tight">{rule.docType.replace(/_/g, " ")}</span>
                    <span className="text-[9px] font-bold text-default-400 uppercase tracking-widest opacity-60">
                      {rule.responsibleRole} • {rule.actionType} • {rule.visibility}
                    </span>
                  </div>
                  {canManage && (
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      className="h-8 rounded-lg font-bold uppercase tracking-wider text-[9px] px-4"
                      onPress={() => {
                        setCreateMode(rule.actionType === "UPLOAD" ? "UPLOAD" : "CREATE");
                        setCreateType(rule.docType);
                        setCreateOpen(true);
                      }}
                    >
                      {rule.actionType === "UPLOAD" ? "Upload" : "Draft"}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <Tabs
            selectedKey={typeTab}
            onSelectionChange={(key) => setTypeTab(String(key))}
            variant="underlined"
            color="primary"
            classNames={{
              tabList: "gap-8 relative rounded-none p-0 border-b border-divider/40 flex-nowrap overflow-x-auto no-scrollbar",
              cursor: "bg-primary w-full h-[3px] rounded-t-full shadow-[0_-1px_10px_rgba(var(--heroui-primary-rgb),0.3)]",
              tab: "max-w-fit px-4 h-12 transition-all duration-300",
              tabContent: "font-bold uppercase tracking-wider text-[11px] text-default-400 group-data-[selected=true]:text-primary"
            }}
          >
            {TYPE_TABS.map((tab) => (
              <Tab key={tab.key} title={tab.label} />
            ))}
          </Tabs>
          {canManage && (
            <Button color="primary" className="h-11 rounded-xl font-bold uppercase tracking-wider text-[11px] px-6" onPress={() => setCreateOpen(true)}>
              Initialize Document
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <Input
            className="w-full md:w-96"
            placeholder="Search Identifier or Entity..."
            variant="flat"
            classNames={{ inputWrapper: "h-11 rounded-xl bg-foreground/[0.03] border-none", input: "text-xs font-semibold" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            className="w-48"
            variant="flat"
            classNames={{ trigger: "h-11 rounded-xl bg-foreground/[0.03] border-none" }}
            label="Filter Status"
            selectedKeys={[statusFilter]}
            onSelectionChange={(keys) => setStatusFilter(String(Array.from(keys)[0] || "ALL"))}
          >
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status} className="capitalize text-foreground">
                {status.toLowerCase()}
              </SelectItem>
            ))}
          </Select>
          {canManage && (
            <Select
              className="w-64"
              variant="flat"
              classNames={{ trigger: "h-11 rounded-xl bg-foreground/[0.03] border-none" }}
              label="Mapping Entity"
              selectedKeys={companyFilter ? [companyFilter] : []}
              onSelectionChange={(keys) => setCompanyFilter(String(Array.from(keys)[0] || ""))}
            >
              {companies.map((company: any) => (
                <SelectItem key={company._id} value={company._id} className="text-foreground">
                  {company.name}
                </SelectItem>
              ))}
            </Select>
          )}
        </div>

        <div className="rounded-[2.5rem] border border-foreground/5 bg-foreground/[0.01] overflow-hidden">
          <table className="w-full text-[11px] font-bold uppercase tracking-tight">
            <thead className="text-[9px] font-bold uppercase tracking-[0.2em] text-default-400 border-b border-foreground/5 bg-foreground/[0.02]">
              <tr>
                <th className="text-left px-8 py-5">Document ID</th>
                <th className="text-left px-8 py-5">Classification</th>
                <th className="text-left px-8 py-5">Mapping Entity</th>
                <th className="text-left px-8 py-5 text-warning font-black">Trade Load</th>
                <th className="text-left px-8 py-5">Process Status</th>
                <th className="text-left px-8 py-5">Sync Log</th>
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
                    className="border-t border-foreground/5 bg-transparent cursor-pointer hover:bg-foreground/[0.03] transition-colors"
                    onClick={() => router.push(`/dashboard/documents/${doc._id}`)}
                  >
                    <td className="px-8 py-5 font-bold text-foreground">{doc.documentNumber}</td>
                    <td className="px-8 py-5 text-default-500 font-medium">{doc.type?.replace(/_/g, " ")}</td>
                    <td className="px-8 py-5 text-foreground">{doc?.seller?.name || "-"}</td>
                    <td className="px-8 py-5 text-warning">{formatRate(Number(doc?.totals?.grandTotal || 0))}</td>
                    <td className="px-8 py-5">
                       <span className={`px-3 py-1 rounded-lg text-[9px] font-bold border border-foreground/5 ${
                         doc.status === "ACCEPTED" ? "bg-success-500/10 text-success" : 
                         doc.status === "REJECTED" ? "bg-danger-500/10 text-danger" : "bg-warning-500/10 text-warning"
                       }`}>
                         {doc.status.replace(/_/g, " ")}
                       </span>
                    </td>
                    <td className="px-8 py-5 text-default-400 font-medium">{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "-"}</td>
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
                <SelectItem key={tab.key} value={tab.key} className="text-foreground">
                  {tab.label}
                </SelectItem>
              ))}
            </Select>
            <Select
              label="Action Type"
              selectedKeys={[createMode]}
              onSelectionChange={(keys) => setCreateMode((String(Array.from(keys)[0] || "CREATE") as "CREATE" | "UPLOAD"))}
            >
              <SelectItem key="CREATE" className="text-foreground">CREATE</SelectItem>
              <SelectItem key="UPLOAD" className="text-foreground">UPLOAD</SelectItem>
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
