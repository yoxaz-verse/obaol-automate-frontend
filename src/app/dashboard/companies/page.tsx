"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Chip, Input, Select, SelectItem, Spinner, Card, Tabs, Tab } from "@nextui-org/react";
import { LuChevronLeft, LuGlobe, LuPhone, LuUser, LuTag, LuUsers, LuBox, LuPackage, LuSearch, LuClock, LuExternalLink, LuHistory, LuActivity } from "react-icons/lu";
import dayjs from "dayjs";
import AuthContext from "@/context/AuthContext";
import { getData, postData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { extractList } from "@/core/data/queryUtils";
import { showToastMessage } from "@/utils/utils";
import VariantRate from "@/components/dashboard/Catalog/variant-rate";
import OrderCard from "@/components/dashboard/orders/OrderCard";
import EnquiryCard from "@/components/dashboard/enquiries/EnquiryCard";

export default function CompanyProductPage() {
  const { user } = useContext(AuthContext);
  const roleLower = String(user?.role || "").toLowerCase();
  const isAdmin = roleLower === "admin";
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [selectedObaolCompanyId, setSelectedObaolCompanyId] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const obaolConfigQuery = useQuery({
    queryKey: ["system-config-obaol-company"],
    queryFn: async () => {
      const response = await getData(apiRoutes.systemConfig.obaolCompany);
      return response?.data?.data || null;
    },
    enabled: isAdmin,
  });

  const companiesQuery = useQuery({
    queryKey: ["admin-company-directory"],
    queryFn: () =>
      getData(apiRoutes.associateCompany.getAll, {
        page: 1,
        limit: 500,
        sort: "name:asc",
      }),
    enabled: isAdmin,
  });

  const obaolConfig = obaolConfigQuery.data;
  const obaolCompanyId = String(obaolConfig?.companyId || "");
  const obaolCompany = obaolConfig?.company || null;
  const companies = useMemo(() => extractList(companiesQuery.data?.data), [companiesQuery.data]);

  useEffect(() => {
    if (!isAdmin) return;
    if (!obaolCompanyId) return;
    setSelectedObaolCompanyId((current) => current || obaolCompanyId);
  }, [isAdmin, obaolCompanyId]);

  const obaolConfigMutation = useMutation({
    mutationFn: async (companyId: string) => {
      const response = await postData(apiRoutes.systemConfig.obaolCompany, { companyId });
      return response?.data?.data || null;
    },
    onSuccess: (data: any) => {
      showToastMessage({
        type: "success",
        message: data?.company?.name ? `OBAOL company set to ${data.company.name}.` : "OBAOL company updated.",
        position: "top-right",
      });
      queryClient.invalidateQueries({ queryKey: ["system-config-obaol-company"] });
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Failed to update OBAOL company configuration.",
        position: "top-right",
      });
    },
  });

  const filteredCompanies = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return companies;
    return companies.filter((company: any) => {
      const name = String(company?.name || "").toLowerCase();
      const email = String(company?.email || "").toLowerCase();
      const phone = String(company?.phone || "").toLowerCase();
      return name.includes(needle) || email.includes(needle) || phone.includes(needle);
    });
  }, [companies, search]);

  const PALETTE = [
    "bg-warning-500/10 text-warning-600",
    "bg-success-500/10 text-success-600",
    "bg-secondary-500/10 text-secondary-600",
    "bg-primary-500/10 text-primary-600",
    "bg-danger-500/10 text-danger-600",
  ];
  const colourFor = (name: string) => PALETTE[name.charCodeAt(0) % PALETTE.length];
  const initials = (name: string) =>
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  const selectedCompanyQuery = useQuery({
    queryKey: ["admin-company-detail", selectedCompanyId],
    queryFn: () => getData(`${apiRoutes.associateCompany.getAll}/${selectedCompanyId}`),
    enabled: isAdmin && Boolean(selectedCompanyId),
  });

  const selectedCompanyStatsQuery = useQuery({
    queryKey: ["admin-company-team-stats", selectedCompanyId],
    queryFn: () => getData(`/api/v1/web/associate-companies/${selectedCompanyId}/stats`),
    enabled: isAdmin && Boolean(selectedCompanyId),
  });

  const selectedCompanyInterestsQuery = useQuery({
    queryKey: ["admin-company-interests", selectedCompanyId],
    queryFn: () =>
      getData("/auth/company-interests/status", {
        associateCompanyId: selectedCompanyId,
      }),
    enabled: isAdmin && Boolean(selectedCompanyId),
  });

  const selectedCompanyOrdersQuery = useQuery({
    queryKey: ["admin-company-orders", selectedCompanyId],
    queryFn: () =>
      getData(apiRoutes.orders.getAll, {
        associateCompanyId: selectedCompanyId,
        page: 1,
        limit: 8,
        sort: "createdAt:desc",
      }),
    enabled: isAdmin && Boolean(selectedCompanyId),
  });

  const selectedCompanyEnquiriesQuery = useQuery({
    queryKey: ["admin-company-enquiries", selectedCompanyId],
    queryFn: () =>
      getData(`/api/v1/web/associate-companies/${selectedCompanyId}/enquiries`, {
        limit: 8,
      }),
    enabled: isAdmin && Boolean(selectedCompanyId),
  });

  const selectedCompanyActivityQuery = useQuery({
    queryKey: ["admin-company-activity", selectedCompanyId],
    queryFn: () =>
      getData(`/api/v1/web/associate-companies/${selectedCompanyId}/activity`, {
        limit: 16,
      }),
    enabled: isAdmin && Boolean(selectedCompanyId),
  });

  const selectedCompany = selectedCompanyQuery.data?.data?.data || null;
  const teamStats = Array.isArray(selectedCompanyStatsQuery.data?.data?.data)
    ? selectedCompanyStatsQuery.data?.data?.data
    : [];
  const interestPayload = selectedCompanyInterestsQuery.data?.data?.data || {};
  const companyInterests = Array.isArray(interestPayload.companyInterests)
    ? interestPayload.companyInterests
    : Array.isArray(selectedCompany?.serviceCapabilities)
      ? selectedCompany.serviceCapabilities
      : [];
  const enquiries = Array.isArray(selectedCompanyEnquiriesQuery.data?.data?.data)
    ? selectedCompanyEnquiriesQuery.data?.data?.data
    : [];
  const activity = Array.isArray(selectedCompanyActivityQuery.data?.data?.data)
    ? selectedCompanyActivityQuery.data?.data?.data
    : [];

  const orders = useMemo(() => {
    const raw: any = selectedCompanyOrdersQuery.data;
    const candidates = [
      raw,
      raw?.data,
      raw?.data?.data,
      raw?.data?.data?.data,
      raw?.results,
      raw?.items,
    ];
    const found = candidates.find((it) => Array.isArray(it));
    if (!Array.isArray(found)) return [];
    return found
      .map((row: any) => row?.data?.data || row?.data || row)
      .filter((row: any) => row && typeof row === "object");
  }, [selectedCompanyOrdersQuery.data]);

  const mappedEnquiries = useMemo(() => {
    if (!Array.isArray(enquiries)) return [];
    return enquiries.map((item: any) => {
      const buyerObj = typeof item.buyerAssociateId === "object" ? item.buyerAssociateId : null;
      const sellerObj = typeof item.sellerAssociateId === "object" ? item.sellerAssociateId : null;
      const mediatorObj = typeof item.mediatorAssociateId === "object" ? item.mediatorAssociateId : null;
      const extractCompanyName = (associate: any, fallbackField: string) =>
        associate?.associateCompany?.name ||
        associate?.associateCompanyId?.name ||
        associate?.company?.name ||
        item?.[fallbackField] ||
        "N/A";
      const buyerName =
        buyerObj?.name ||
        item.buyerAssociateName ||
        item.buyerName ||
        (typeof item.buyerAssociateId === "string" ? `Associate (${item.buyerAssociateId.slice(-6)})` : "N/A");
      const sellerName =
        sellerObj?.name ||
        item.sellerAssociateName ||
        item.sellerName ||
        (typeof item.sellerAssociateId === "string" ? `Associate (${item.sellerAssociateId.slice(-6)})` : "N/A");
      const buyerCompany = extractCompanyName(buyerObj, "buyerAssociateCompanyName");
      const sellerCompany = extractCompanyName(sellerObj, "sellerAssociateCompanyName");
      const typeValue = mediatorObj ? "Mediated" : "Buying";
      return {
        ...item,
        type: typeValue,
        specification: item.specifications || "No Spec",
        product: item.productId?.name || "N/A",
        counterparty: `${buyerName} / ${sellerName}`,
        counterpartyLabel: "Buyer / Supplier",
        associateCompany: `${buyerCompany} / ${sellerCompany}`,
        assignedOperator: item.supplierOperatorId?.name || item.dealCloserOperatorId?.name || "Unassigned",
        mediatorAssociate: item.mediatorAssociateId?.name || "Direct",
        status: item.status || "New",
        quantity: item.quantity || null,
        isAdmin: true,
        supplierPhone: item.sellerAssociateId?.phone || "N/A",
        buyerPhone: item.buyerAssociateId?.phone || "N/A",
        operatorPhone: item.supplierOperatorId?.phone || "+917306096941",
      };
    });
  }, [enquiries]);

  if (!isAdmin) {
    return (
      <div className="w-full p-6">
        <div className="rounded-xl border border-default-200 bg-content1 p-6 text-default-700">
          This page is available only for admins.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6 space-y-6">
      <div className="rounded-xl border border-default-200 bg-content1 p-4 md:p-6">
        <div className="mb-4 flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-foreground">OBAOL Company Configuration</h2>
          <p className="text-sm text-default-600">
            Select the system company used for Seller ↔ OBAOL and OBAOL ↔ Buyer document generation.
          </p>
        </div>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Chip size="sm" color={obaolCompanyId ? "success" : "warning"} variant="flat">
            {obaolCompanyId ? "Configured" : "Missing"}
          </Chip>
          {obaolCompany?.name && (
            <span className="text-sm text-default-600">
              Current: <span className="font-medium text-foreground">{obaolCompany.name}</span>
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(240px,1fr)_auto] md:items-end">
          <Select
            label="OBAOL Company"
            labelPlacement="outside"
            placeholder="Select the OBAOL company"
            isLoading={companiesQuery.isLoading}
            selectedKeys={selectedObaolCompanyId ? new Set([selectedObaolCompanyId]) : new Set()}
            onSelectionChange={(keys) => {
              const nextValue = Array.from(keys as Set<string>)[0] || "";
              setSelectedObaolCompanyId(nextValue);
            }}
          >
            {companies.map((companyItem: any) => (
              <SelectItem key={companyItem?._id || companyItem?.id} value={companyItem?._id || companyItem?.id}>
                {companyItem?.name || "Unnamed Company"}
              </SelectItem>
            ))}
          </Select>
          <Button
            color="primary"
            isLoading={obaolConfigMutation.isPending}
            isDisabled={!selectedObaolCompanyId}
            onPress={() => obaolConfigMutation.mutate(selectedObaolCompanyId)}
          >
            Save OBAOL Company
          </Button>
        </div>
        <div className="mt-4 text-xs text-default-500">
          This configuration is required to draft quotations, proforma invoices, and purchase orders without errors.
        </div>
      </div>

      <div className="rounded-xl border border-default-200 bg-content1 p-4 md:p-6">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">All Companies</h2>
            <p className="text-sm text-default-600">Search and select a company to view details.</p>
          </div>
          <Input
            placeholder="Search by name, email, or phone"
            value={search}
            onValueChange={setSearch}
            radius="full"
            className="max-w-md"
          />
        </div>

        <div className="w-full">
          {!selectedCompanyId ? (
            <div className="w-full space-y-6">
              {companiesQuery.isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-10 h-10 border-2 border-warning border-t-transparent rounded-full animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-default-400 italic">Accessing Corporate Records...</p>
                </div>
              ) : filteredCompanies.length === 0 ? (
                <div className="py-20 text-center bg-default-100/20 rounded-3xl border border-dashed border-default-200">
                  <p className="text-default-500 text-sm font-bold italic">No entities found in this transmission.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <LuUsers className="text-default-400" size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-default-400 italic">
                      {filteredCompanies.length} ENTITY_RECORDS // BROADCASTING
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-default-200/50 to-transparent" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredCompanies.map((company: any, idx: number) => {
                      const name = String(company?.name || "Unnamed Company");
                      return (
                        <button
                          key={company?._id || idx}
                          type="button"
                          onClick={() => setSelectedCompanyId(company?._id || null)}
                          className="group relative text-left flex flex-col gap-4 rounded-3xl border border-foreground/[0.06] bg-foreground/[0.01] p-5 hover:border-warning-500/30 hover:bg-warning-500/[0.03] transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-warning-500/[0.05]"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div
                              className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-[12px] font-black shadow-inner ${colourFor(
                                name
                              )}`}
                            >
                              {initials(name)}
                            </div>
                            <div className="grow flex flex-col min-w-0">
                              <span className="text-sm font-black text-foreground leading-tight line-clamp-2 group-hover:text-warning-600 transition-colors">
                                {name}
                              </span>
                              <span className="text-[10px] font-bold text-default-400 uppercase tracking-widest mt-1">
                                {company?.companyType?.name || "TYPE_PENDING"}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mt-auto">
                            <div className="flex items-center gap-2 text-[10px] text-default-500 font-medium truncate">
                              <LuGlobe size={12} className="shrink-0 text-default-300" />
                              {company?.email || "NO_UPLINK"}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-default-500 font-medium">
                              <LuPhone size={12} className="shrink-0 text-default-300" />
                              {company?.phone || "NO_COMM_LINE"}
                            </div>
                          </div>

                          <div className="pt-3 border-t border-default-200/40 flex items-center justify-between">
                            <span className="text-[9px] font-black text-warning-500 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
                              ACCESS_FILE_0x{idx.toString(16).toUpperCase()}
                            </span>
                            <div className="w-6 h-6 rounded-lg bg-default-100 flex items-center justify-center group-hover:bg-warning-500 group-hover:text-white transition-all">
                              <LuChevronLeft size={14} className="rotate-180" />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-default-200/50">
                <div className="flex items-center gap-4">
                  <Button 
                    isIconOnly 
                    variant="flat" 
                    radius="full" 
                    size="sm" 
                    className="bg-default-100/50 hover:bg-default-200"
                    onPress={() => setSelectedCompanyId(null)}
                  >
                    <LuChevronLeft size={18} />
                  </Button>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-warning rounded-full shadow-[0_0_8px_rgba(255,193,7,0.4)]" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-warning-600 italic">Corporate Entity Details</span>
                    </div>
                    <h3 className="text-2xl font-black tracking-tight text-foreground">{selectedCompany?.name || "Target Entity"}</h3>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedCompany?.companyType?.name && (
                    <Chip size="sm" variant="flat" color="primary" className="font-bold uppercase text-[9px] tracking-widest px-3">
                      {selectedCompany.companyType.name}
                    </Chip>
                  )}
                  {typeof selectedCompany?.isWebsiteLive === "boolean" && (
                    <Chip 
                      size="sm" 
                      variant="flat" 
                      color={selectedCompany.isWebsiteLive ? "success" : "warning"}
                      className="font-bold uppercase text-[9px] tracking-widest px-3"
                    >
                      {selectedCompany.isWebsiteLive ? "Website Active" : "Internal Sync Only"}
                    </Chip>
                  )}
                </div>
              </header>

              {selectedCompanyQuery.isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-10 h-10 border-2 border-warning border-t-transparent rounded-full animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-default-400 italic">Interrogating Database...</p>
                </div>
              ) : !selectedCompany ? (
                <div className="py-20 text-center">
                  <p className="text-default-500 text-sm italic font-bold">Target sequence not found in system directory.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-4 space-y-6">
                    <Card className="rounded-3xl bg-default-100/30 border border-default-200/50 p-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                          <LuGlobe className="text-warning-500" size={16} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-default-400">Communication Terminal</span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold uppercase text-default-400 tracking-widest mb-0.5">Primary Link</span>
                            <p className="text-sm font-black text-foreground break-all">{selectedCompany?.email || "NOT_ASSIGNED"}</p>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold uppercase text-default-400 tracking-widest mb-0.5">Secure Line</span>
                            <p className="text-sm font-black text-foreground">{selectedCompany?.phone || "NO_UPLINK"}</p>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold uppercase text-default-400 tracking-widest mb-0.5">Geospatial Vector</span>
                            <p className="text-[11px] font-bold text-default-500 leading-relaxed">{selectedCompany?.address || "COORDINATES_MISSING"}</p>
                          </div>
                          {selectedCompany?.website && (
                             <div className="pt-2 border-t border-default-200/40">
                               <a 
                                 href={selectedCompany.website.startsWith('http') ? selectedCompany.website : `https://${selectedCompany.website}`} 
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 className="text-xs font-black text-warning-500 hover:text-warning-600 transition-colors inline-flex items-center gap-2 group"
                               >
                                 ACCESS EXTERNAL PORTAL
                                 <LuExternalLink size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                               </a>
                             </div>
                          )}
                        </div>
                      </div>
                    </Card>

                    <Card className="rounded-3xl bg-default-100/30 border border-default-200/50 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <LuUser className="text-primary-500" size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-default-400">Execution Proxy</span>
                      </div>
                      {selectedCompany?.assignedOperator ? (
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary flex items-center justify-center font-black">
                            {initials(selectedCompany.assignedOperator.name || "OP")}
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <p className="text-sm font-black text-foreground truncate">{selectedCompany.assignedOperator.name || "UNNAMED_OPERATOR"}</p>
                            <p className="text-[10px] font-bold text-default-400 uppercase tracking-widest">Active Sequence Handler</p>
                          </div>
                        </div>
                      ) : (
                        <div className="py-4 text-center border-2 border-dashed border-default-200 rounded-2xl">
                          <p className="text-[10px] font-bold text-default-400 uppercase italic">Awaiting Operator Assignment</p>
                        </div>
                      )}
                    </Card>

                    <Card className="rounded-3xl bg-default-100/30 border border-default-200/50 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <LuTag className="text-secondary-500" size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-default-400">Sector Affiliations</span>
                      </div>
                      {companyInterests.length ? (
                        <div className="flex flex-wrap gap-2">
                          {companyInterests.map((interest: string) => (
                            <Chip key={interest} size="sm" variant="dot" color="warning" className="font-bold uppercase text-[8px] tracking-[0.2em] border-none bg-warning-500/5">
                              {String(interest || "").replace(/_/g, " ")}
                            </Chip>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] font-bold text-default-400 uppercase italic">No interests configured.</p>
                      )}
                    </Card>
                  </div>

                  <div className="lg:col-span-8 space-y-8">
                    {/* Media & About Section */}
                    {(selectedCompany?.banner || selectedCompany?.logo || selectedCompany?.description) && (
                      <div className="rounded-[2.5rem] bg-foreground/[0.02] border border-foreground/5 overflow-hidden">
                         {selectedCompany?.banner && (
                            <div className="h-48 w-full relative">
                               <img src={selectedCompany.banner} alt="Banner" className="w-full h-full object-cover" />
                               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            </div>
                         )}
                         <div className="p-8 -mt-12 relative z-10">
                            <div className="flex flex-col md:flex-row gap-8">
                               {selectedCompany?.logo && (
                                  <div className="w-32 h-32 shrink-0 rounded-3xl bg-background border-4 border-foreground/10 shadow-2xl overflow-hidden self-center md:self-start">
                                     <img src={selectedCompany.logo} alt="Logo" className="w-full h-full object-cover" />
                                  </div>
                               )}
                               <div className="flex-1 space-y-4 pt-12 md:pt-14">
                                  <div className="space-y-1">
                                     <span className="text-[9px] font-black uppercase tracking-[0.4em] text-warning-500/60 italic">Strategic Narrative</span>
                                     <p className="text-sm font-bold text-default-600 leading-relaxed italic line-clamp-3">
                                        "{selectedCompany?.description || "No mission statement recorded."}"
                                     </p>
                                  </div>
                                  <div className="pt-4 space-y-2">
                                     <span className="text-[9px] font-black uppercase tracking-[0.4em] text-default-400 italic">Core Mission</span>
                                     <div className="text-sm font-medium text-default-500 leading-relaxed whitespace-pre-wrap">
                                        {selectedCompany?.aboutUs || "Awaiting profile finalization..."}
                                     </div>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                    )}

                    {/* Associates Grid */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <LuUsers className="text-primary-500" size={18} />
                        <span className="text-sm font-black uppercase tracking-[0.25em] text-foreground">Personnel Network</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-default-200/50 to-transparent" />
                        <span className="text-[10px] font-black text-default-400 bg-default-100 px-2 py-1 rounded-md uppercase tracking-widest">{teamStats.length} ENTITY_LINKS</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {teamStats.map((member: any, idx: number) => (
                          <Card key={member?._id || idx} className="bg-default-50/50 border border-default-200/40 hover:border-primary-500/30 transition-all p-4 shadow-sm group">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-primary-500/5 group-hover:bg-primary-500/10 flex items-center justify-center font-black text-xs text-primary-600 transition-colors">
                                  {initials(member?.name || "??")}
                               </div>
                               <div className="flex-1 overflow-hidden">
                                  <p className="text-sm font-black text-foreground truncate">{member?.name || "IDENTITY_REDACTED"}</p>
                                  <p className="text-[10px] font-bold text-default-400 truncate tracking-widest uppercase italic">{member?.email || "NO_SECURE_LINK"}</p>
                               </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Trading Intelligence Feed */}
                    <div className="space-y-6">
                       <Tabs 
                         variant="underlined" 
                         className="border-b border-default-200/50 w-full"
                         classNames={{
                           tabList: "gap-8 h-12 w-full",
                           cursor: "w-full bg-warning-500 h-0.5",
                           tab: "max-w-fit px-0 h-12",
                           tabContent: "group-data-[selected=true]:text-warning-600 font-black uppercase text-[10px] tracking-[0.2em] italic"
                         }}
                       >
                         <Tab 
                           key="catalog" 
                           title={
                             <div className="flex items-center gap-2">
                               <LuBox size={14} />
                               <span>Terminal Catalog</span>
                             </div>
                           }
                         >
                           <div className="pt-6">
                              <VariantRate rate="displayedRate" displayOnly additionalParams={{ associateCompany: selectedCompanyId }} />
                           </div>
                         </Tab>
                         <Tab 
                           key="orders" 
                           title={
                             <div className="flex items-center gap-2">
                               <LuPackage size={14} />
                               <span>Execution Ledger</span>
                             </div>
                           }
                         >
                           <div className="pt-6 space-y-4">
                              {orders.length ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {orders.map((order: any) => <OrderCard key={order?._id || order?.id} data={order} />)}
                                </div>
                              ) : (
                                <div className="py-12 flex flex-col items-center gap-4 bg-default-100/20 rounded-3xl border border-dashed border-default-200">
                                   <LuHistory className="text-default-300" size={32} />
                                   <p className="text-[10px] font-black uppercase tracking-widest text-default-400 italic">No trading history recorded</p>
                                </div>
                              )}
                           </div>
                         </Tab>
                         <Tab 
                           key="enquiries" 
                           title={
                             <div className="flex items-center gap-2">
                               <LuSearch size={14} />
                               <span>Live Inquiries</span>
                             </div>
                           }
                         >
                           <div className="pt-6 space-y-4">
                              {mappedEnquiries.length ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {mappedEnquiries.map((enquiry: any) => <EnquiryCard key={enquiry?._id || enquiry?.id} data={enquiry} />)}
                                </div>
                              ) : (
                                <div className="py-12 flex flex-col items-center gap-4 bg-default-100/20 rounded-3xl border border-dashed border-default-200">
                                   <LuActivity className="text-default-300" size={32} />
                                   <p className="text-[10px] font-black uppercase tracking-widest text-default-400 italic">Clean radar // No active inquiries</p>
                                </div>
                              )}
                           </div>
                         </Tab>
                         <Tab 
                           key="activity" 
                           title={
                             <div className="flex items-center gap-2">
                               <LuClock size={14} />
                               <span>System Pulse</span>
                             </div>
                           }
                         >
                            <div className="pt-6 space-y-3">
                               {activity.length ? (
                                  activity.map((item: any) => (
                                     <div key={`${item.type}-${item.id}`} className="flex items-center justify-between p-4 rounded-2xl bg-default-50/50 border border-default-200/40 group hover:border-warning-500/20 transition-all">
                                        <div className="flex items-center gap-4">
                                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.type === 'order' ? 'bg-primary-500/10 text-primary-600' : 'bg-warning-500/10 text-warning-600'}`}>
                                              {item.type === 'order' ? <LuPackage size={14} /> : <LuSearch size={14} />}
                                           </div>
                                           <div className="flex flex-col">
                                              <p className="text-[11px] font-black uppercase text-foreground">{item.title || "ACTIVITY_SIGNAL"}</p>
                                              <p className="text-[9px] font-bold text-default-400 tracking-widest uppercase italic">{item.status || "TRANSITIONING"}</p>
                                           </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-default-400 uppercase tabular-nums">
                                           {item.createdAt ? dayjs(item.createdAt).format("DD MMM · HH:mm") : "N/A"}
                                        </span>
                                     </div>
                                  ))
                               ) : (
                                  <p className="text-[10px] font-bold text-default-400 uppercase italic py-10 text-center">Protocol telemetry silent.</p>
                               )}
                            </div>
                         </Tab>
                       </Tabs>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
