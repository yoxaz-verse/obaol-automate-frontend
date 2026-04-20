"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Chip, Input, Select, SelectItem, Spinner, Card, Tabs, Tab } from "@nextui-org/react";
import { LuChevronLeft, LuGlobe, LuPhone, LuUser, LuTag, LuUsers, LuBox, LuPackage, LuSearch, LuClock, LuExternalLink, LuHistory, LuActivity, LuTerminal, LuArrowRight, LuSettings } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
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
  const [isConfigExpanded, setIsConfigExpanded] = useState(false);

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
  const toText = (value: any, fallback = ""): string => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      const out = String(value).trim();
      return out || fallback;
    }
    if (Array.isArray(value)) {
      const out = value
        .map((entry) => toText(entry, ""))
        .filter(Boolean)
        .join(", ");
      return out || fallback;
    }
    if (typeof value === "object") {
      const out =
        toText(value?.name, "") ||
        toText(value?.label, "") ||
        toText(value?.title, "") ||
        toText(value?.slug, "");
      return out || fallback;
    }
    return fallback;
  };
  const toName = (value: any, fallback = "") => toText(value?.name ?? value, fallback);
  const normalizeInterestList = (raw: any) => {
    if (!Array.isArray(raw)) return [];
    return raw
      .map((entry: any, idx: number) => {
        const key = toText(entry?._id, "") || `${toText(entry?.slug, "") || toText(entry, "interest")}-${idx}`;
        const labelSource = toName(entry, "") || toText(entry, "");
        const label = labelSource
          .replace(/_/g, " ")
          .replace(/-/g, " ")
          .trim();
        return { key, label: label || "UNKNOWN" };
      })
      .filter((entry: { label: string }) => Boolean(entry.label));
  };

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
  const assignedCount = useMemo(
    () => companies.filter((company: any) => Boolean(company?.assignedOperator)).length,
    [companies]
  );
  const unassignedCount = companies.length - assignedCount;
  const liveCount = useMemo(
    () => companies.filter((company: any) => company?.isWebsiteLive === true).length,
    [companies]
  );
  const notLiveCount = companies.length - liveCount;

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

  const [associateLimit, setAssociateLimit] = useState(50);

  const selectedCompanyAssociatesQuery = useQuery({
    queryKey: ["admin-company-associates", selectedCompanyId, associateLimit],
    queryFn: () =>
      getData(apiRoutes.associate.getAll, {
        associateCompany: selectedCompanyId,
        page: 1,
        limit: associateLimit,
        sort: "createdAt:desc",
      }),
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
  const selectedCompanyName = toName(selectedCompany, "Target Entity");
  const selectedCompanyEmail = toText(selectedCompany?.email, "NOT_ASSIGNED");
  const selectedCompanyPhone = toText(selectedCompany?.phone, "NO_UPLINK");
  const selectedCompanyAddress = toText(selectedCompany?.address, "COORDINATES_MISSING");
  const selectedCompanyWebsite = toText(selectedCompany?.website, "");
  const selectedCompanyDescription = toText(selectedCompany?.description, "No mission statement recorded.");
  const selectedCompanyAbout = toText(
    selectedCompany?.aboutUs,
    "Awaiting profile finalization and entity narrative baseline..."
  );
  const selectedCompanyBanner = toText(selectedCompany?.banner, "");
  const selectedCompanyLogo = toText(selectedCompany?.logo, "");
  const associates = useMemo(
    () => extractList(selectedCompanyAssociatesQuery.data?.data),
    [selectedCompanyAssociatesQuery.data]
  );
  const associatesTotal =
    selectedCompanyAssociatesQuery.data?.data?.totalCount ||
    selectedCompanyAssociatesQuery.data?.data?.data?.totalCount ||
    0;
  const interestPayload = selectedCompanyInterestsQuery.data?.data?.data || {};
  const companyInterestsSource = Array.isArray(interestPayload.companyInterests)
    ? interestPayload.companyInterests
    : Array.isArray(selectedCompany?.serviceCapabilities)
      ? selectedCompany.serviceCapabilities
      : [];
  const companyInterests = useMemo(
    () => normalizeInterestList(companyInterestsSource),
    [companyInterestsSource]
  );
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
    <div className="w-full p-4 md:p-6 space-y-10">
      
      {/* Tactical Configuration Node */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2rem] border border-divider bg-content1/50 shadow-xl backdrop-blur-2xl"
      >
        <button
          type="button"
          onClick={() => setIsConfigExpanded((current) => !current)}
          className="w-full px-5 md:px-7 py-5 text-left"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-warning-500/10 border border-warning-500/20">
                <LuSettings className="text-warning-500" size={12} />
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-warning-500">Configuration Terminal</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-default-500">
                {obaolCompanyId ? "Protocol_Synchronized" : "Mapping_Required"}
                {toName(obaolCompany, "") ? ` // Active: ${toName(obaolCompany, "").toUpperCase()}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-3 py-2 rounded-xl border flex items-center gap-2 ${
                obaolCompanyId ? "bg-success-500/10 border-success-500/20" : "bg-warning-500/10 border-warning-500/20"
              }`}>
                <div className={`w-2 h-2 rounded-full ${obaolCompanyId ? "bg-success-500" : "bg-warning-500"}`} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${obaolCompanyId ? "text-success-500" : "text-warning-500"}`}>
                  {obaolCompanyId ? "Live" : "Pending"}
                </span>
              </div>
              <div className={`transition-transform duration-300 ${isConfigExpanded ? "rotate-[-90deg]" : "rotate-180"}`}>
                <LuChevronLeft size={20} className="text-default-500" />
              </div>
            </div>
          </div>
        </button>

        {isConfigExpanded ? (
          <div className="px-5 md:px-7 pb-6 md:pb-7 border-t border-divider/70">
            <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] items-end gap-6 p-6 md:p-7 mt-5 rounded-[1.5rem] bg-content2/30 dark:bg-black/20 border border-divider shadow-inner relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-warning-500/20 rounded-tl-sm" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-warning-500/20 rounded-br-sm" />
              <Select
                label="Select Command Entity"
                labelPlacement="outside"
                placeholder="Search Corporate Directory..."
                isLoading={companiesQuery.isLoading}
                selectedKeys={selectedObaolCompanyId ? new Set([selectedObaolCompanyId]) : new Set()}
                onSelectionChange={(keys) => {
                  const nextValue = Array.from(keys as Set<string>)[0] || "";
                  setSelectedObaolCompanyId(nextValue);
                }}
                popoverProps={{
                  classNames: {
                    base: "before:bg-divider",
                    content: "bg-content1/90 dark:bg-[#0B0F14]/90 backdrop-blur-2xl border border-divider shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[2rem] p-2",
                  },
                  offset: 12
                }}
                listboxProps={{
                  itemClasses: {
                    base: [
                      "rounded-2xl",
                      "transition-opacity",
                      "data-[hover=true]:bg-warning-500/10",
                      "data-[selectable=true]:focus:bg-warning-500/10",
                      "data-[selected=true]:bg-warning-500/20",
                      "data-[selected=true]:text-warning-500",
                      "py-3",
                      "px-4",
                      "my-1"
                    ],
                  },
                }}
                classNames={{
                  trigger: "bg-content1 dark:bg-white/[0.03] border-divider hover:border-warning-500/50 transition-all h-14 rounded-2xl shadow-sm",
                  label: "text-[10px] font-black uppercase tracking-[0.3em] text-default-400 mb-3 ml-1",
                  value: "text-sm font-black text-foreground uppercase tracking-widest",
                  base: "max-w-full"
                }}
                renderValue={(items) => {
                  return items.map((item) => (
                    <div key={item.key} className="flex items-center gap-3">
                      <div className="w-1 h-3 bg-warning-500 rounded-full" />
                      <span className="text-sm font-black uppercase italic tracking-tighter">{toName(item.data, "UNNAMED")}</span>
                    </div>
                  ));
                }}
              >
                {companies.map((companyItem: any) => {
                  const cName = toName(companyItem, "Unnamed Entity");
                  const cEmail = toText(companyItem?.email, "protocol_link_pending");
                  return (
                    <SelectItem
                      key={companyItem?._id || companyItem?.id}
                      textValue={cName}
                      className="group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-default-100 dark:bg-white/5 flex items-center justify-center text-default-400 group-data-[selected=true]:bg-warning-500 group-data-[selected=true]:text-black transition-all border border-divider">
                          <LuBox size={18} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[12px] font-black uppercase italic tracking-tighter leading-tight">{cName}</span>
                          <span className="text-[9px] font-bold text-default-500 dark:text-default-400 lowercase tracking-[0.1em] opacity-60">{cEmail}</span>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </Select>

              <Button
                className="h-14 px-10 rounded-2xl bg-warning-500 text-black font-black uppercase tracking-[0.25em] italic text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-warning-500/40"
                isLoading={obaolConfigMutation.isPending}
                isDisabled={!selectedObaolCompanyId}
                onPress={() => obaolConfigMutation.mutate(selectedObaolCompanyId)}
                endContent={<LuArrowRight size={16} className="ml-1" />}
              >
                Apply Protocol
              </Button>
            </div>
            <div className="mt-5 flex items-center justify-center gap-4 opacity-50">
              <LuTerminal className="text-default-400" size={12} />
              <p className="text-[9px] font-black text-default-400 uppercase tracking-[0.3em] italic">
                Secure_Config_Chain_v4.2 // OBAOL_SYSTEM_CORE
              </p>
            </div>
          </div>
        ) : null}
      </motion.div>

      {/* Directory Section */}
      <div className="relative space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card className="border border-divider bg-content1/50 rounded-[1.75rem] p-4 md:p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-default-500">Operator Allocation</p>
                <p className="text-xs font-bold text-default-400 uppercase tracking-wider">Assigned vs Unassigned</p>
              </div>
              <LuUsers className="text-primary-500/70" size={18} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-success-500/20 bg-success-500/10 p-3">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-success-600">Assigned</p>
                <p className="text-2xl font-black text-success-500">{assignedCount}</p>
              </div>
              <div className="rounded-xl border border-warning-500/20 bg-warning-500/10 p-3">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-warning-600">Unassigned</p>
                <p className="text-2xl font-black text-warning-500">{unassignedCount}</p>
              </div>
            </div>
          </Card>
          <Card className="border border-divider bg-content1/50 rounded-[1.75rem] p-4 md:p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-default-500">Website Status</p>
                <p className="text-xs font-bold text-default-400 uppercase tracking-wider">Live vs Not Live</p>
              </div>
              <LuGlobe className="text-warning-500/70" size={18} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-success-500/20 bg-success-500/10 p-3">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-success-600">Live</p>
                <p className="text-2xl font-black text-success-500">{liveCount}</p>
              </div>
              <div className="rounded-xl border border-danger-500/20 bg-danger-500/10 p-3">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-danger-600">Not Live</p>
                <p className="text-2xl font-black text-danger-500">{notLiveCount}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-1 h-6 bg-warning-500 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-foreground italic">Corporate <span className="text-default-400">Directory</span></h2>
            </div>
            <p className="text-[10px] font-bold text-default-500 uppercase tracking-widest opacity-80">
              Search and analyze all entities within the strategic network.
            </p>
          </div>
          <Input
            placeholder="Interrogate Records (Name, Email, Phone)..."
            value={search}
            onValueChange={setSearch}
            radius="full"
            className="max-width-md"
            startContent={<LuSearch className="text-default-400" size={18} />}
            classNames={{
               inputWrapper: "bg-content1/50 border-divider backdrop-blur-xl h-12 shadow-inner",
               input: "text-sm font-medium"
            }}
          />
        </div>

        <div className="w-full">
          {!selectedCompanyId ? (
            <div className="w-full space-y-6">
              {companiesQuery.isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-6">
                  <div className="w-12 h-12 border-2 border-warning-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(245,158,11,0.2)]" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-warning-500/60 animate-pulse">Accessing Secure Records...</p>
                </div>
              ) : filteredCompanies.length === 0 ? (
                <div className="py-24 text-center bg-content1/20 rounded-[2.5rem] border border-dashed border-divider">
                  <LuSearch className="mx-auto text-default-300 mb-4" size={32} />
                  <p className="text-default-500 text-sm font-black uppercase tracking-widest opacity-60">No entities identified in current sector.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 px-2">
                    <LuUsers className="text-warning-500/50" size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-default-400 italic">
                      {filteredCompanies.length} ACTIVE_RECORDS // TRANSMITTING
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-divider to-transparent" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCompanies.map((company: any, idx: number) => {
                      const name = String(company?.name || "Unnamed Company");
                      return (
                        <motion.button
                          key={company?._id || idx}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: (idx % 20) * 0.03 }}
                          onClick={() => setSelectedCompanyId(company?._id || null)}
                          className="group relative text-left flex flex-col gap-6 rounded-[2.5rem] border border-divider bg-content1/30 p-6 hover:border-warning-500/40 hover:bg-content1 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-warning-500/[0.05] backdrop-blur-xl"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div
                              className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-black shadow-inner border border-white/5 ${colourFor(
                                name
                              )}`}
                            >
                              {initials(name)}
                            </div>
                            <div className="grow flex flex-col min-w-0 pt-1">
                              <span className="text-base font-black text-foreground leading-tight line-clamp-2 group-hover:text-warning-600 transition-colors uppercase tracking-tight italic">
                                {name}
                              </span>
                              <span className="text-[10px] font-black text-default-500 uppercase tracking-widest mt-2 bg-default-100 dark:bg-white/5 w-fit px-2 py-0.5 rounded-lg border border-divider">
                                {toName(company?.companyType, "TYPE_PENDING")}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mt-auto">
                            <div className="flex items-center gap-3 text-[10px] text-default-500 font-black uppercase tracking-widest truncate">
                              <LuGlobe size={14} className="shrink-0 text-warning-500/40" />
                              {toText(company?.email, "NO_UPLINK")}
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-default-500 font-black uppercase tracking-widest">
                              <LuPhone size={14} className="shrink-0 text-primary-500/40" />
                              {toText(company?.phone, "NO_COMM_LINE")}
                            </div>
                          </div>

                          <div className="pt-4 border-t border-divider flex items-center justify-between">
                            <span className="text-[9px] font-black text-warning-500 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-500">
                              SECURE_ACCESS_0x{idx.toString(16).toUpperCase()}
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-default-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-warning-500 group-hover:text-black transition-all">
                              <LuChevronLeft size={16} className="rotate-180" />
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-divider">
                <div className="flex items-center gap-6">
                  <Button 
                    isIconOnly 
                    variant="flat" 
                    radius="full" 
                    size="lg" 
                    className="bg-content2/50 hover:bg-warning-500 hover:text-black transition-all shadow-sm"
                    onPress={() => setSelectedCompanyId(null)}
                  >
                    <LuChevronLeft size={24} />
                  </Button>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-warning-500 rounded-full shadow-[0_0_12px_rgba(255,193,7,0.6)]" />
                      <span className="text-[11px] font-black uppercase tracking-[0.4em] text-warning-600 dark:text-warning-500 italic">Corporate Entity Details</span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground uppercase italic">{selectedCompanyName}</h3>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {toName(selectedCompany?.companyType, "") && (
                    <Chip size="sm" variant="flat" color="primary" className="font-black uppercase text-[10px] tracking-[0.2em] px-4 py-4 rounded-xl border border-primary-500/20">
                      {toName(selectedCompany?.companyType, "TYPE_PENDING")}
                    </Chip>
                  )}
                  {typeof selectedCompany?.isWebsiteLive === "boolean" && (
                    <Chip 
                      size="sm" 
                      variant="flat" 
                      color={selectedCompany.isWebsiteLive ? "success" : "warning"}
                      className="font-black uppercase text-[10px] tracking-[0.2em] px-4 py-4 rounded-xl border border-divider"
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
                    <Card className="rounded-[2.5rem] bg-content2/30 dark:bg-white/[0.02] border border-divider p-8 shadow-sm backdrop-blur-xl">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                          <LuGlobe className="text-warning-500" size={16} />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-default-400 italic">Communication Terminal</span>
                        </div>
                        <div className="space-y-5">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase text-default-500 tracking-[0.2em] mb-1 opacity-60">Primary Link</span>
                            <p className="text-sm font-black text-foreground break-all tracking-tight">{selectedCompanyEmail}</p>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase text-default-500 tracking-[0.2em] mb-1 opacity-60">Secure Line</span>
                            <p className="text-sm font-black text-foreground tracking-tight">{selectedCompanyPhone}</p>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase text-default-500 tracking-[0.2em] mb-1 opacity-60">Geospatial Vector</span>
                            <p className="text-[11px] font-bold text-default-500 dark:text-default-400 leading-relaxed uppercase tracking-widest">{selectedCompanyAddress}</p>
                          </div>
                          {selectedCompanyWebsite && (
                             <div className="pt-4 border-t border-divider">
                               <a 
                                 href={selectedCompanyWebsite.startsWith("http") ? selectedCompanyWebsite : `https://${selectedCompanyWebsite}`} 
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-warning-500/5 hover:bg-warning-500/10 border border-warning-500/10 text-xs font-black text-warning-600 dark:text-warning-500 transition-all group/link"
                               >
                                 ACCESS EXTERNAL PORTAL
                                 <LuExternalLink size={16} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                               </a>
                             </div>
                          )}
                        </div>
                      </div>
                    </Card>

                    <Card className="rounded-[2.5rem] bg-content2/30 dark:bg-white/[0.02] border border-divider p-8 shadow-sm backdrop-blur-xl">
                      <div className="flex items-center gap-3 mb-6">
                        <LuUser className="text-primary-500" size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-default-400 italic">Execution Proxy</span>
                      </div>
                      {selectedCompany?.assignedOperator ? (
                        <div className="flex items-center gap-5 p-4 rounded-3xl bg-primary-500/5 border border-primary-500/10">
                          <div className="w-12 h-12 rounded-2xl bg-primary-500 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-primary-500/20">
                            {initials(toName(selectedCompany?.assignedOperator, "OP"))}
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <p className="text-sm font-black text-foreground truncate uppercase tracking-tight">{toName(selectedCompany?.assignedOperator, "UNNAMED_OPERATOR")}</p>
                            <p className="text-[9px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest mt-1">Active Sequence Handler</p>
                          </div>
                        </div>
                      ) : (
                        <div className="py-6 text-center border border-dashed border-divider rounded-3xl bg-default-50/50">
                          <p className="text-[10px] font-black text-default-400 uppercase italic tracking-widest leading-loose">Awaiting Operator Assignment <br/> // PROTOCOL_BYPASS_ENABLED</p>
                        </div>
                      )}
                    </Card>

                    <Card className="rounded-[2.5rem] bg-content2/30 dark:bg-white/[0.02] border border-divider p-8 shadow-sm backdrop-blur-xl">
                      <div className="flex items-center gap-3 mb-6">
                        <LuTag className="text-secondary-500" size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-default-400 italic">Sector Affiliations</span>
                      </div>
                      {companyInterests.length ? (
                        <div className="flex flex-wrap gap-2.5">
                          {companyInterests.map((interest) => (
                            <Chip key={interest.key} size="sm" variant="flat" color="warning" className="font-black uppercase text-[9px] tracking-[0.2em] px-3 py-3 rounded-lg border border-warning-500/10">
                              {interest.label}
                            </Chip>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] font-black text-default-400 uppercase italic tracking-widest py-2">No sector tags configured in entity file.</p>
                      )}
                    </Card>
                  </div>

                  <div className="lg:col-span-8 space-y-8">
                    {/* Media & About Section */}
                    {(selectedCompanyBanner || selectedCompanyLogo || selectedCompanyDescription) && (
                      <div className="rounded-[3rem] bg-content1 border border-divider overflow-hidden shadow-2xl relative">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-warning-500/5 blur-[80px] rounded-full -mr-16 -mt-16 pointer-events-none" />
                         {selectedCompanyBanner && (
                            <div className="h-64 w-full relative">
                               <img src={selectedCompanyBanner} alt="Banner" className="w-full h-full object-cover" />
                               <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                            </div>
                         )}
                         <div className="p-8 md:p-12 -mt-20 relative z-10">
                            <div className="flex flex-col md:flex-row gap-10 items-start md:items-end">
                               {selectedCompanyLogo && (
                                  <div className="w-40 h-40 shrink-0 rounded-[2.5rem] bg-background border-4 border-divider shadow-2xl overflow-hidden group">
                                     <img src={selectedCompanyLogo} alt="Logo" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                  </div>
                               )}
                               <div className="flex-1 space-y-6 pb-2">
                                  <div className="space-y-3">
                                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-warning-500 italic">Strategic Narrative</span>
                                     <p className="text-lg font-black text-foreground italic leading-tight uppercase tracking-tight">
                                        {selectedCompanyDescription}
                                     </p>
                                  </div>
                               </div>
                            </div>
                            
                            <div className="mt-12 space-y-4 max-w-4xl">
                               <div className="flex items-center gap-4">
                                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-default-400 italic">Core Mission Profile</span>
                                  <div className="flex-1 h-px bg-divider" />
                               </div>
                               <div className="text-[13px] font-bold text-default-600 dark:text-default-400 leading-relaxed whitespace-pre-wrap uppercase tracking-widest opacity-90 first-letter:text-2xl first-letter:font-black first-letter:text-warning-500">
                                  {selectedCompanyAbout}
                               </div>
                            </div>
                         </div>
                      </div>
                    )}

                    {/* Personnel Network Header & Grid */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 px-2">
                        <div className="w-1.5 h-6 bg-primary-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
                        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-foreground italic">Personnel <span className="text-default-400">Network</span></h2>
                        <div className="flex-1 h-px bg-divider" />
                        <Chip variant="flat" color="primary" className="font-black uppercase text-[9px] tracking-[0.3em] px-4">{associatesTotal} AGENTS_IDENTIFIED</Chip>
                      </div>

                      {selectedCompanyAssociatesQuery.isLoading ? (
                        <div className="py-12 flex items-center justify-center">
                          <Spinner size="lg" color="primary" />
                        </div>
                      ) : associates.length ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {associates.map((member: any, idx: number) => (
                            <motion.div
                              key={member?._id || idx}
                              whileHover={{ y: -5 }}
                              className="group relative rounded-[2.5rem] bg-content2/40 dark:bg-white/[0.02] border border-divider p-6 hover:border-primary-500/40 transition-all duration-500 shadow-sm"
                            >
                              <div className="flex items-start gap-5">
                                 <div className="w-16 h-16 rounded-[1.25rem] bg-primary-500/10 group-hover:bg-primary-500/20 flex items-center justify-center font-black text-base text-primary-600 dark:text-primary-400 transition-all border border-primary-500/10">
                                    {initials(member?.name || "??")}
                                 </div>
                                 <div className="flex-1 overflow-hidden space-y-2">
                                    <p className="text-base font-black text-foreground uppercase tracking-tight italic truncate">{member?.name || "IDENTITY_REDACTED"}</p>
                                    <div className="space-y-1">
                                       <p className="text-[10px] font-black text-default-500 truncate tracking-widest uppercase italic opacity-70 group-hover:opacity-100 transition-opacity">{member?.email || "NO_SECURE_LINK"}</p>
                                       <p className="text-[10px] font-black text-default-500 truncate tracking-widest uppercase italic opacity-70 group-hover:opacity-100 transition-opacity">{member?.phone || "NO_DIRECT_LINE"}</p>
                                    </div>
                                    {member?.designation && (
                                      <Chip size="sm" className="bg-primary-500 font-black text-white uppercase text-[8px] tracking-[0.2em] px-2 h-5 mt-1">
                                        {member.designation}
                                      </Chip>
                                    )}
                                 </div>
                              </div>
                              <div className="mt-6 pt-4 border-t border-divider flex flex-wrap gap-2">
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${member?.isEmailVerified ? "bg-success-500/10 text-success-600 border border-success-500/20" : "bg-default-100 text-default-400 border border-divider"}`}>
                                  <div className={`w-1 h-1 rounded-full ${member?.isEmailVerified ? "bg-success-500 animate-pulse" : "bg-default-400"}`} />
                                  Email_Vrd
                                </div>
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${member?.isPhoneVerified ? "bg-success-500/10 text-success-600 border border-success-500/20" : "bg-default-100 text-default-400 border border-divider"}`}>
                                  <div className={`w-1 h-1 rounded-full ${member?.isPhoneVerified ? "bg-success-500 animate-pulse" : "bg-default-400"}`} />
                                  Phone_Vrd
                                </div>
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${member?.isOneToOneVerified ? "bg-success-500/10 text-success-600 border border-success-500/20" : "bg-default-100 text-default-400 border border-divider"}`}>
                                  <div className={`w-1 h-1 rounded-full ${member?.isOneToOneVerified ? "bg-success-500 animate-pulse" : "bg-default-400"}`} />
                                  SEC_Vrd
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 flex flex-col items-center gap-4 bg-content1/50 rounded-[2.5rem] border border-dashed border-divider">
                          <LuUser className="text-default-200" size={32} />
                          <p className="text-[10px] font-black text-default-400 uppercase tracking-[0.4em] italic leading-loose text-center px-10">
                            Personnel database static // No associated entities found <br/> // PROTOCOL_BYPASS_INITIATED
                          </p>
                        </div>
                      )}
                      
                      {associatesTotal > associates.length && (
                        <div className="flex justify-center pt-4">
                           <Button
                             size="lg"
                             variant="flat"
                             radius="full"
                             onPress={() => setAssociateLimit((prev) => prev + 50)}
                             className="font-black uppercase tracking-[0.3em] text-[10px] px-10 border border-divider"
                           >
                             Interrogate_More_Personnel
                           </Button>
                        </div>
                      )}
                    </div>

                    {/* Operational Intelligence Terminal */}
                    <div className="space-y-8 pt-8 relative">
                       <div className="absolute top-0 left-0 w-24 h-px bg-gradient-to-r from-warning-500 to-transparent" />
                       <Tabs 
                         variant="underlined" 
                         className="w-full"
                         classNames={{
                           tabList: "gap-10 h-14 w-full border-b border-divider",
                           cursor: "w-full bg-warning-500 h-1 shadow-[0_0_12px_rgba(245,158,11,0.5)]",
                           tab: "max-w-fit px-0 h-14",
                           tabContent: "group-data-[selected=true]:text-warning-500 font-black uppercase text-[11px] tracking-[0.3em] italic transition-colors"
                         }}
                       >
                         <Tab 
                           key="catalog" 
                           title={
                             <div className="flex items-center gap-3">
                               <LuBox size={16} />
                               <span>Terminal_Catalog</span>
                             </div>
                           }
                         >
                           <div className="pt-10">
                              <VariantRate rate="displayedRate" displayOnly additionalParams={{ associateCompany: selectedCompanyId }} />
                           </div>
                         </Tab>
                         <Tab 
                           key="orders" 
                           title={
                             <div className="flex items-center gap-3">
                               <LuPackage size={16} />
                               <span>Execution_Ledger</span>
                             </div>
                           }
                         >
                           <div className="pt-10 space-y-6">
                              {orders.length ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  {orders.map((order: any) => <OrderCard key={order?._id || order?.id} data={order} />)}
                                </div>
                              ) : (
                                <div className="py-24 flex flex-col items-center gap-6 bg-content2/20 rounded-[3rem] border border-dashed border-divider">
                                   <LuHistory className="text-default-200" size={48} />
                                   <p className="text-[11px] font-black uppercase tracking-[0.4em] text-default-400 italic">Historical ledger clean // No tactical records found</p>
                                </div>
                              )}
                           </div>
                         </Tab>
                         <Tab 
                           key="enquiries" 
                           title={
                             <div className="flex items-center gap-3">
                               <LuSearch size={16} />
                               <span>Live_Telemetry</span>
                             </div>
                           }
                         >
                           <div className="pt-10 space-y-6">
                              {mappedEnquiries.length ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  {mappedEnquiries.map((enquiry: any) => <EnquiryCard key={enquiry?._id || enquiry?.id} data={enquiry} />)}
                                </div>
                              ) : (
                                <div className="py-24 flex flex-col items-center gap-6 bg-content2/20 rounded-[3rem] border border-dashed border-divider">
                                   <LuActivity className="text-default-200" size={48} />
                                   <p className="text-[11px] font-black uppercase tracking-[0.4em] text-default-400 italic">No active inquiries detected in sector radar</p>
                                </div>
                              )}
                           </div>
                         </Tab>
                         <Tab 
                           key="activity" 
                           title={
                             <div className="flex items-center gap-3">
                               <LuClock size={16} />
                               <span>System_Pulse</span>
                             </div>
                           }
                         >
                            <div className="pt-10 space-y-4">
                               {activity.length ? (
                                  activity.map((item: any, i: number) => (
                                     <motion.div 
                                      key={`${item.type}-${item.id}`} 
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: i * 0.05 }}
                                      className="flex items-center justify-between p-6 rounded-[1.5rem] bg-content2/50 dark:bg-white/[0.01] border border-divider group hover:border-warning-500/30 transition-all shadow-sm"
                                     >
                                        <div className="flex items-center gap-6">
                                           <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${item.type === 'order' ? 'bg-primary-500/10 text-primary-500 border-primary-500/20 group-hover:bg-primary-500/20' : 'bg-warning-500/10 text-warning-500 border-warning-500/20 group-hover:bg-warning-500/20'}`}>
                                              {item.type === 'order' ? <LuPackage size={18} /> : <LuSearch size={18} />}
                                           </div>
                                           <div className="flex flex-col">
                                              <p className="text-[12px] font-black uppercase text-foreground tracking-tight">{item.title || "ACTIVITY_SIGNAL"}</p>
                                              <div className="flex items-center gap-3 mt-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-warning-500 animate-pulse" />
                                                <p className="text-[10px] font-black text-warning-600 dark:text-warning-500 tracking-[0.2em] uppercase italic opacity-80">{item.status || "TRANSITIONING_SEQUENCE"}</p>
                                              </div>
                                           </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                          <span className="text-[11px] font-black text-default-600 dark:text-default-400 uppercase tracking-widest tabular-nums">
                                             {item.createdAt ? dayjs(item.createdAt).format("DD MMM") : "N/A"}
                                          </span>
                                          <span className="text-[9px] font-bold text-default-400 uppercase tabular-nums opacity-60">
                                             {item.createdAt ? dayjs(item.createdAt).format("HH:mm:ss") : "--:--:--"}
                                          </span>
                                        </div>
                                     </motion.div>
                                  ))
                               ) : (
                                  <div className="py-24 text-center border border-dashed border-divider rounded-[3rem]">
                                    <p className="text-[11px] font-black text-default-400 uppercase tracking-[0.4em] italic">Protocol telemetry silent // No signals recorded.</p>
                                  </div>
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
