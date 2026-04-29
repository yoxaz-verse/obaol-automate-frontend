"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Button, Chip, Input, Select, SelectItem, Autocomplete, AutocompleteItem, 
  Spinner, Card, Tabs, Tab, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter 
} from "@nextui-org/react";
import { 
  LuFilter, LuSearch, LuExternalLink, LuActivity, LuUser, LuPlus, LuGlobe, 
  LuChevronLeft, LuBox, LuArrowRight, LuTerminal, LuArrowUpRight, LuUsers, 
  LuSettings, LuPhone, LuTag, LuPackage, LuHistory, LuClock, LuMail, LuLock 
} from "react-icons/lu";
import OnboardingModal from "@/components/dashboard/Company/OnboardingModal";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import AuthContext from "@/context/AuthContext";
import { getData, patchData, postData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { extractList } from "@/core/data/queryUtils";
import { showToastMessage } from "@/utils/utils";
import VariantRate from "@/components/dashboard/Catalog/variant-rate";
import OrderCard from "@/components/dashboard/orders/OrderCard";
import EnquiryCard from "@/components/dashboard/enquiries/EnquiryCard";
import { dashboardCopy } from "@/utils/dashboardCopy";

export default function CompanyProductPage() {
  const { user } = useContext(AuthContext);
  const roleLower = String(user?.role || "").toLowerCase();
  const isAdmin = roleLower === "admin";
  const isOperatorFamily = roleLower === "operator" || roleLower === "team";
  const canAccessCompaniesWorkspace = isAdmin || isOperatorFamily;
  const queryClient = useQueryClient();
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [directoryPage, setDirectoryPage] = useState(1);
  const [selectedObaolCompanyId, setSelectedObaolCompanyId] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState("catalog");
  const [isConfigExpanded, setIsConfigExpanded] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedOperatorId, setSelectedOperatorId] = useState("");
  const [operatorSearchText, setOperatorSearchText] = useState("");

  const obaolConfigQuery = useQuery({
    queryKey: ["system-config-obaol-company"],
    queryFn: async () => {
      const response = await getData(apiRoutes.systemConfig.obaolCompany);
      return response?.data?.data || null;
    },
    enabled: isAdmin,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  const DIRECTORY_PAGE_SIZE = 24;

  const companiesQuery = useQuery({
    queryKey: ["company-directory", roleLower, user?.id, directoryPage, debouncedSearch],
    queryFn: () =>
      getData(apiRoutes.associateCompany.getAll, {
        page: directoryPage,
        limit: DIRECTORY_PAGE_SIZE,
        sort: "name:asc",
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(isOperatorFamily && user?.id ? { assignedOperator: user.id } : {}),
      }),
    enabled: canAccessCompaniesWorkspace,
    placeholderData: (previousData) => previousData,
  });

  const configCompaniesQuery = useQuery({
    queryKey: ["company-config-selector-list", isAdmin],
    queryFn: () =>
      getData(apiRoutes.associateCompany.getAll, {
        page: 1,
        limit: 200,
        sort: "name:asc",
      }),
    enabled: isAdmin && isConfigExpanded,
  });

  const totalCompaniesQuery = useQuery({
    queryKey: ["company-metrics-total", roleLower, user?.id],
    queryFn: () =>
      getData(apiRoutes.associateCompany.getAll, {
        page: 1,
        limit: 1,
        ...(isOperatorFamily && user?.id ? { assignedOperator: user.id } : {}),
      }),
    enabled: canAccessCompaniesWorkspace,
  });

  const liveCompaniesQuery = useQuery({
    queryKey: ["company-metrics-live", roleLower, user?.id],
    queryFn: () =>
      getData(apiRoutes.associateCompany.getAll, {
        page: 1,
        limit: 1,
        isWebsiteLive: true,
        ...(isOperatorFamily && user?.id ? { assignedOperator: user.id } : {}),
      }),
    enabled: canAccessCompaniesWorkspace,
  });

  const systemMetricsQuery = useQuery({
    queryKey: ["company-metrics-system", isAdmin],
    queryFn: () => getData(apiRoutes.analytics.systemMetrics),
    enabled: isAdmin,
  });

  const obaolConfig = obaolConfigQuery.data;
  const obaolCompanyId = String(obaolConfig?.companyId || "");
  const obaolCompany = obaolConfig?.company || null;
  const companiesPayload = companiesQuery.data?.data;
  const companies = useMemo(() => extractList(companiesPayload), [companiesPayload]);
  const configCompanies = useMemo(
    () => extractList(configCompaniesQuery.data?.data),
    [configCompaniesQuery.data]
  );

  const getTotalCount = (payload: any): number => {
    const raw =
      payload?.totalCount ??
      payload?.data?.totalCount ??
      payload?.data?.data?.totalCount ??
      0;
    return Number(raw || 0);
  };

  const directoryTotalCount = getTotalCount(companiesPayload);
  const directoryCurrentPage = Number(
    companiesPayload?.currentPage ??
      companiesPayload?.data?.currentPage ??
      directoryPage
  );
  const directoryTotalPages = Math.max(
    Number(
      companiesPayload?.totalPages ??
        companiesPayload?.data?.totalPages ??
        Math.ceil(directoryTotalCount / DIRECTORY_PAGE_SIZE) ??
        1
    ) || 1,
    1
  );

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

  const toIdValue = (value: any): string => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string" || typeof value === "number") return String(value);
    if (typeof value === "object") return String(value?._id || value?.id || "");
    return "";
  };

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
        return { key, label: dashboardCopy(label || "Unknown") };
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

  const totalCompaniesCount = getTotalCount(totalCompaniesQuery.data?.data);
  const liveCompaniesCount = getTotalCount(liveCompaniesQuery.data?.data);
  const unassignedCount = isAdmin
    ? Number(systemMetricsQuery.data?.data?.data?.unassignedCompanies || 0)
    : 0;
  const assignedCount = Math.max(totalCompaniesCount - unassignedCount, 0);
  const liveCount = liveCompaniesCount;
  const notLiveCount = Math.max(totalCompaniesCount - liveCompaniesCount, 0);

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
    queryKey: ["company-detail", selectedCompanyId],
    queryFn: () => getData(`${apiRoutes.associateCompany.getAll}/${selectedCompanyId}`),
    enabled: canAccessCompaniesWorkspace && Boolean(selectedCompanyId),
  });

  const operatorsQuery = useQuery({
    queryKey: ["admin-operator-list-for-company-assignment"],
    queryFn: () => getData(apiRoutes.operator.getAll, { page: 1, limit: 5000, sort: "name:asc" }),
    enabled: isAdmin && Boolean(selectedCompanyId),
  });

  const [associateLimit, setAssociateLimit] = useState(50);

  const selectedCompanyAssociatesQuery = useQuery({
    queryKey: ["company-associates", selectedCompanyId, associateLimit],
    queryFn: () =>
      getData(apiRoutes.associate.getAll, {
        associateCompany: selectedCompanyId,
        page: 1,
        limit: associateLimit,
        sort: "createdAt:desc",
      }),
    enabled: canAccessCompaniesWorkspace && Boolean(selectedCompanyId),
  });

  const selectedCompanyInterestsQuery = useQuery({
    queryKey: ["company-interests", selectedCompanyId],
    queryFn: () =>
      getData("/auth/company-interests/status", {
        associateCompanyId: selectedCompanyId,
      }),
    enabled: canAccessCompaniesWorkspace && Boolean(selectedCompanyId),
  });

  const selectedCompanyOrdersQuery = useQuery({
    queryKey: ["company-orders", selectedCompanyId],
    queryFn: () =>
      getData(apiRoutes.orders.getAll, {
        associateCompanyId: selectedCompanyId,
        page: 1,
        limit: 8,
        sort: "createdAt:desc",
      }),
    enabled: canAccessCompaniesWorkspace && Boolean(selectedCompanyId) && activeDetailTab === "orders",
  });

  const selectedCompanyEnquiriesQuery = useQuery({
    queryKey: ["company-enquiries", selectedCompanyId],
    queryFn: () =>
      getData(`/api/v1/web/associate-companies/${selectedCompanyId}/enquiries`, {
        limit: 8,
      }),
    enabled: canAccessCompaniesWorkspace && Boolean(selectedCompanyId) && activeDetailTab === "enquiries",
  });

  const selectedCompanyActivityQuery = useQuery({
    queryKey: ["company-activity", selectedCompanyId],
    queryFn: () =>
      getData(`/api/v1/web/associate-companies/${selectedCompanyId}/activity`, {
        limit: 16,
      }),
    enabled: canAccessCompaniesWorkspace && Boolean(selectedCompanyId) && activeDetailTab === "activity",
  });

  const selectedCompany = selectedCompanyQuery.data?.data?.data || null;
  const selectedCompanyAssignedOperatorId = toIdValue(selectedCompany?.assignedOperator);
  const selectedCompanyName = toName(selectedCompany, "Target Entity");
  const selectedCompanyEmail = toText(selectedCompany?.email, "Not available");
  const selectedCompanyPhone = toText(selectedCompany?.phone, "Not available");
  const selectedCompanyAddress = toText(selectedCompany?.address, "Address not available");
  const selectedCompanyWebsite = toText(selectedCompany?.website, "");
  const selectedCompanyDescription = toText(selectedCompany?.description, "No mission statement recorded.");
  const selectedCompanyAbout = toText(
    selectedCompany?.aboutUs,
    "Awaiting profile finalization and entity narrative baseline..."
  );
  const selectedCompanyBanner = toText(selectedCompany?.banner, "");
  const selectedCompanyLogo = toText(selectedCompany?.logo, "");
  const selectedCompanyAssignedOperatorName = toName(selectedCompany?.assignedOperator, "Unassigned");
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
  const companyInterests = normalizeInterestList(companyInterestsSource);
  const enquiries = useMemo(
    () =>
      Array.isArray(selectedCompanyEnquiriesQuery.data?.data?.data)
        ? selectedCompanyEnquiriesQuery.data?.data?.data
        : [],
    [selectedCompanyEnquiriesQuery.data?.data?.data]
  );
  const activity = useMemo(
    () =>
      Array.isArray(selectedCompanyActivityQuery.data?.data?.data)
        ? selectedCompanyActivityQuery.data?.data?.data
        : [],
    [selectedCompanyActivityQuery.data?.data?.data]
  );

  const operatorOptions = useMemo(() => {
    const rows = extractList(operatorsQuery.data);
    return rows
      .filter((row: any) => {
        const isApproved = String(row?.registrationStatus || "").toUpperCase() === "APPROVED";
        const isActive = row?.isActive !== false;
        const isDeleted = row?.isDeleted === true;
        return isApproved && isActive && !isDeleted;
      })
      .map((row: any) => ({
        id: toIdValue(row?._id || row?.id),
        name: String(row?.name || "Unnamed operator"),
        email: String(row?.email || ""),
      }))
      .filter((row: { id: string }) => Boolean(row.id));
  }, [operatorsQuery.data]);

  const filteredOperatorOptions = useMemo(() => {
    const needle = operatorSearchText.trim().toLowerCase();
    if (!needle) return operatorOptions;
    
    const exactMatch = operatorOptions.find(o => o.name.toLowerCase() === needle);
    if (exactMatch && selectedOperatorId === exactMatch.id) return operatorOptions;
    
    return operatorOptions.filter(o => 
      o.name.toLowerCase().includes(needle) || 
      o.email.toLowerCase().includes(needle)
    );
  }, [operatorOptions, operatorSearchText, selectedOperatorId]);

  useEffect(() => {
    if (!isAssignModalOpen) return;
    const initialId = selectedCompanyAssignedOperatorId || "";
    setSelectedOperatorId(initialId);
    
    const match = operatorOptions.find(o => o.id === initialId);
    setOperatorSearchText(match ? match.name : "");
  }, [isAssignModalOpen, selectedCompanyAssignedOperatorId, operatorOptions]);

  const assignOperatorMutation = useMutation({
    mutationFn: async (operatorId: string | null) => {
      if (!isAdmin) throw new Error("Only admins can change operator assignment.");
      if (!selectedCompanyId) throw new Error("Please select a company first.");
      return patchData(`${apiRoutes.associateCompany.getAll}/${selectedCompanyId}`, {
        assignedOperator: operatorId || null,
      });
    },
    onSuccess: (_response, operatorId) => {
      showToastMessage({
        type: "success",
        message: operatorId ? "Operator assigned successfully." : "Operator unassigned successfully.",
        position: "top-right",
      });
      queryClient.invalidateQueries({ queryKey: ["company-directory"] });
      queryClient.invalidateQueries({ queryKey: ["company-detail", selectedCompanyId] });
      setIsAssignModalOpen(false);
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Failed to update operator assignment.",
        position: "top-right",
      });
    },
  });

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
        isAdmin: canAccessCompaniesWorkspace,
        supplierPhone: item.sellerAssociateId?.phone || "N/A",
        buyerPhone: item.buyerAssociateId?.phone || "N/A",
        operatorPhone: item.supplierOperatorId?.phone || "+917306096941",
      };
    });
  }, [canAccessCompaniesWorkspace, enquiries]);

  if (!canAccessCompaniesWorkspace) {
    return (
      <div className="w-full p-6">
        <div className="rounded-xl border border-default-200 bg-content1 p-6 text-default-700">
           This page is available for admins and operators.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6 space-y-10">
      
      {/* Configuration */}
      {isAdmin ? (
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
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-warning-500">Configuration</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-default-500">
                {dashboardCopy(obaolCompanyId ? "PROTOCOL_SYNCHRONIZED" : "MAPPING_REQUIRED")}
                {toName(obaolCompany, "") ? ` | Active company: ${toName(obaolCompany, "")}` : ""}
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
                label="Select company"
                labelPlacement="outside"
                placeholder="Search companies..."
                isLoading={configCompaniesQuery.isLoading}
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
                      <span className="text-sm font-black uppercase italic tracking-tighter">{toName(item.data, "Unnamed")}</span>
                    </div>
                  ));
                }}
              >
                {configCompanies.map((companyItem: any) => {
                  const cName = toName(companyItem, "Unnamed Entity");
                  const cEmail = toText(companyItem?.email, "not available");
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
                Save configuration
              </Button>
            </div>
            <div className="mt-5 flex items-center justify-center gap-4 opacity-50">
              <LuTerminal className="text-default-400" size={12} />
              <p className="text-[9px] font-black text-default-400 uppercase tracking-[0.3em] italic">
                {dashboardCopy("SECURE_CONFIG_CHAIN_V4_2")} | {dashboardCopy("OBAOL_SYSTEM_CORE")}
              </p>
            </div>
          </div>
        ) : null}
      </motion.div>
      ) : null}

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

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-1 h-6 bg-warning-500 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-foreground italic">Company <span className="text-default-400">Directory</span></h2>
            </div>
            <p className="text-[10px] font-bold text-default-500 uppercase tracking-widest opacity-80">
              Search companies by name, email, or phone.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Input
              placeholder="Search records..."
              value={search}
              onValueChange={(value) => {
                setSearch(value);
                setDirectoryPage(1);
              }}
              radius="full"
              className="sm:w-80"
              startContent={<LuSearch className="text-default-400" size={18} />}
              classNames={{
                 inputWrapper: "bg-content1/50 border-divider backdrop-blur-xl h-12 shadow-inner",
                 input: "text-sm font-medium"
              }}
            />
            <Button
              color="primary"
              variant="shadow"
              radius="full"
              onPress={() => setIsOnboardModalOpen(true)}
              className="h-12 px-8 font-black uppercase text-[10px] tracking-tighter italic bg-gradient-to-tr from-primary-600 to-primary-400 shadow-[0_10px_40px_-10px_rgba(0,111,238,0.5)]"
              startContent={<LuPlus size={16} />}
            >
              Add New Associate + Company
            </Button>
          </div>
        </div>

        <OnboardingModal 
          isOpen={isOnboardModalOpen} 
          onOpenChange={setIsOnboardModalOpen}
        />

        <div className="w-full">
          {!selectedCompanyId ? (
            <div className="w-full space-y-6">
              {companiesQuery.isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-6">
                  <div className="w-12 h-12 border-2 border-warning-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(245,158,11,0.2)]" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-warning-500/60 animate-pulse">Loading companies...</p>
                </div>
              ) : companies.length === 0 ? (
                <div className="py-24 text-center bg-content1/20 rounded-[2.5rem] border border-dashed border-divider">
                  <LuSearch className="mx-auto text-default-300 mb-4" size={32} />
                  <p className="text-default-500 text-sm font-black uppercase tracking-widest opacity-60">No companies found.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 px-2">
                    <LuUsers className="text-warning-500/50" size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-default-400 italic">
                      {directoryTotalCount} companies found
                    </span>
                    {companiesQuery.isFetching ? (
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-warning-500/70">
                        Refreshing...
                      </span>
                    ) : null}
                    <div className="flex-1 h-px bg-gradient-to-r from-divider to-transparent" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {companies.map((company: any, idx: number) => {
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
                                {dashboardCopy(toName(company?.companyType, "TYPE_PENDING"))}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mt-auto">
                            <div className="flex items-center gap-3 text-[10px] text-default-500 font-black uppercase tracking-widest truncate">
                              <LuGlobe size={14} className="shrink-0 text-warning-500/40" />
                              {toText(company?.email, "Not available")}
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-default-500 font-black uppercase tracking-widest">
                              <LuPhone size={14} className="shrink-0 text-primary-500/40" />
                              {toText(company?.phone, "Not available")}
                            </div>
                          </div>

                          <div className="pt-4 border-t border-divider flex items-center justify-between">
                            <span className="text-[9px] font-black text-warning-500 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-500">
                              Open details
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-default-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-warning-500 group-hover:text-black transition-all">
                              <LuChevronLeft size={16} className="rotate-180" />
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-divider/70 bg-content1/30 px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-default-500">
                      Page {directoryCurrentPage} of {directoryTotalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => setDirectoryPage((prev) => Math.max(prev - 1, 1))}
                        isDisabled={directoryCurrentPage <= 1 || companiesQuery.isFetching}
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => setDirectoryPage((prev) => Math.min(prev + 1, directoryTotalPages))}
                        isDisabled={directoryCurrentPage >= directoryTotalPages || companiesQuery.isFetching}
                      >
                        Next
                      </Button>
                    </div>
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
                      <span className="text-[11px] font-black uppercase tracking-[0.4em] text-warning-600 dark:text-warning-500 italic">Company Details</span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground uppercase italic">{selectedCompanyName}</h3>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  {toName(selectedCompany?.companyType, "") && (
                    <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-primary-500/10 bg-primary-500/5">
                      <div className="w-1 h-3 bg-primary-500/30 rounded-full" />
                      <span className="text-[9px] font-black uppercase tracking-[0.25em] text-primary-600 dark:text-primary-400">
                        {dashboardCopy(toName(selectedCompany?.companyType, "TYPE_PENDING"))}
                      </span>
                    </div>
                  )}
                  {typeof selectedCompany?.isWebsiteLive === "boolean" && (
                    <div className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border transition-all ${
                      selectedCompany.isWebsiteLive 
                        ? "border-success-500/10 bg-success-500/5 text-success-600 dark:text-success-400" 
                        : "border-warning-500/10 bg-warning-500/5 text-warning-600 dark:text-warning-400"
                    }`}>
                      <div className={`w-1 h-3 rounded-full ${selectedCompany.isWebsiteLive ? "bg-success-500/30" : "bg-warning-500/30"}`} />
                      <span className="text-[9px] font-black uppercase tracking-[0.25em]">
                        {selectedCompany.isWebsiteLive ? "Website Active" : "Internal Sync Only"}
                      </span>
                    </div>
                  )}
                </div>
              </header>

              {selectedCompanyQuery.isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-10 h-10 border-2 border-warning border-t-transparent rounded-full animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-default-400 italic">Loading company details...</p>
                </div>
              ) : !selectedCompany ? (
                <div className="py-20 text-center">
                  <p className="text-default-500 text-sm italic font-bold">Company not found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-4 space-y-6">
                    <Card className="rounded-[2.5rem] bg-content2/30 dark:bg-white/[0.02] border border-divider p-8 shadow-sm backdrop-blur-xl">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                          <LuGlobe className="text-warning-500" size={16} />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-default-400 italic">Contact Information</span>
                        </div>
                        <div className="space-y-5">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase text-default-500 tracking-[0.2em] mb-1 opacity-60">Email</span>
                            <p className="text-sm font-black text-foreground break-all tracking-tight">{selectedCompanyEmail}</p>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase text-default-500 tracking-[0.2em] mb-1 opacity-60">Phone</span>
                            <p className="text-sm font-black text-foreground tracking-tight">{selectedCompanyPhone}</p>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase text-default-500 tracking-[0.2em] mb-1 opacity-60">Address</span>
                            <p className="text-[11px] font-bold text-default-500 dark:text-default-400 leading-relaxed">{selectedCompanyAddress}</p>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card className="rounded-[2.5rem] bg-content2/30 dark:bg-white/[0.02] border border-divider p-8 shadow-sm backdrop-blur-xl">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <LuUser className="text-primary-500" size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-default-400 italic">Execution Proxy</span>
                          </div>
                          {isAdmin ? (
                            <Button
                              size="sm"
                              variant="flat"
                              color="warning"
                              onPress={() => setIsAssignModalOpen(true)}
                            >
                              Assign Operator
                            </Button>
                          ) : null}
                        </div>
                        <div className="space-y-2">
                          <p className="text-[9px] font-black uppercase text-default-500 tracking-[0.2em] opacity-60">Assigned Operator</p>
                          <p className="text-sm font-black text-foreground tracking-tight">{selectedCompanyAssignedOperatorName}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[9px] font-black uppercase text-default-500 tracking-[0.2em] opacity-60">Mission Profile</p>
                          <p className="text-[11px] font-bold text-default-500 dark:text-default-400 leading-relaxed">
                            {selectedCompanyDescription}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[9px] font-black uppercase text-default-500 tracking-[0.2em] opacity-60">Strategic Narrative</p>
                          <p className="text-[11px] font-bold text-default-500 dark:text-default-400 leading-relaxed">
                            {selectedCompanyAbout}
                          </p>
                        </div>
                        {selectedCompanyWebsite ? (
                          <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            startContent={<LuExternalLink size={14} />}
                            onPress={() => window.open(selectedCompanyWebsite, "_blank", "noopener,noreferrer")}
                          >
                            Open Website
                          </Button>
                        ) : null}
                      </div>
                    </Card>

                    <Card className="rounded-[2.5rem] bg-content2/30 dark:bg-white/[0.02] border border-divider p-8 shadow-sm backdrop-blur-xl">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <LuTag className="text-secondary-500" size={16} />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-default-400 italic">Sector Affiliations</span>
                        </div>
                        {companyInterests.length ? (
                          <div className="flex flex-wrap gap-2">
                            {companyInterests.map((interest: { key: string; label: string }) => (
                              <Chip key={interest.key} size="sm" color="secondary" variant="flat">
                                {interest.label}
                              </Chip>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-default-500">No sector tags configured for this company.</p>
                        )}
                      </div>
                    </Card>
                  </div>

                  <div className="lg:col-span-8 space-y-6">
                    <Card className="rounded-[2.5rem] bg-content2/30 dark:bg-white/[0.02] border border-divider p-6 shadow-sm backdrop-blur-xl">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <LuUsers className="text-warning-500" size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-default-400 italic">Personnel Network</span>
                          </div>
                          <Chip size="sm" color="primary" variant="flat">
                            {associatesTotal || associates.length} Associates
                          </Chip>
                        </div>
                        {selectedCompanyAssociatesQuery.isLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Spinner />
                          </div>
                        ) : selectedCompanyAssociatesQuery.isError ? (
                          <div className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-500/30 dark:bg-danger-500/10 dark:text-danger-200">
                            Failed to load associates.
                          </div>
                        ) : associates.length === 0 ? (
                          <p className="text-sm text-default-500 py-2">No associates linked to this company.</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px] text-sm">
                              <thead className="bg-default-100/70">
                                <tr>
                                  <th className="text-left px-3 py-2 font-semibold text-default-700">Name</th>
                                  <th className="text-left px-3 py-2 font-semibold text-default-700">Email</th>
                                  <th className="text-left px-3 py-2 font-semibold text-default-700">Phone</th>
                                  <th className="text-left px-3 py-2 font-semibold text-default-700">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {associates.map((item: any, idx: number) => (
                                  <tr
                                    key={item?._id || idx}
                                    className={`border-t border-default-200/70 ${idx % 2 ? "bg-default-50/30 dark:bg-default-100/5" : ""}`}
                                  >
                                    <td className="px-3 py-2 font-medium text-foreground">{toName(item?.name, "-")}</td>
                                    <td className="px-3 py-2 text-default-600">{toText(item?.email, "-")}</td>
                                    <td className="px-3 py-2 text-default-600">{toText(item?.phone, "-")}</td>
                                    <td className="px-3 py-2">
                                      <Chip size="sm" variant="flat" color={String(item?.registrationStatus || "").toUpperCase() === "APPROVED" ? "success" : "warning"}>
                                        {toText(item?.registrationStatus, "PENDING_REVIEW")}
                                      </Chip>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </Card>

                    <Card className="rounded-[2.5rem] bg-content2/30 dark:bg-white/[0.02] border border-divider p-6 shadow-sm backdrop-blur-xl">
                      <Tabs
                        selectedKey={activeDetailTab}
                        onSelectionChange={(key) => setActiveDetailTab(String(key))}
                        variant="underlined"
                        classNames={{
                          tabList: "gap-6 border-b border-divider/60",
                          tab: "text-[10px] font-black uppercase tracking-[0.2em]",
                        }}
                      >
                        <Tab key="catalog" title="Catalog">
                          <div className="pt-5">
                            <VariantRate
                              rate="variantRate"
                              additionalParams={{ associateCompany: [selectedCompanyId], view: "catalog" }}
                              hideBuiltInFilters
                              showAssociateColumn={isAdmin}
                            />
                          </div>
                        </Tab>
                        <Tab key="orders" title="Orders">
                          <div className="pt-5">
                            {selectedCompanyOrdersQuery.isLoading ? (
                              <div className="flex items-center justify-center py-8">
                                <Spinner />
                              </div>
                            ) : orders.length === 0 ? (
                              <p className="text-sm text-default-500 py-2">No orders found for this company.</p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {orders.map((order: any, idx: number) => (
                                  <OrderCard key={order?._id || idx} data={order} />
                                ))}
                              </div>
                            )}
                          </div>
                        </Tab>
                        <Tab key="enquiries" title="Enquiries">
                          <div className="pt-5">
                            {selectedCompanyEnquiriesQuery.isLoading ? (
                              <div className="flex items-center justify-center py-8">
                                <Spinner />
                              </div>
                            ) : mappedEnquiries.length === 0 ? (
                              <p className="text-sm text-default-500 py-2">No enquiries found for this company.</p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {mappedEnquiries.map((enquiry: any, idx: number) => (
                                  <EnquiryCard key={enquiry?._id || idx} data={enquiry} />
                                ))}
                              </div>
                            )}
                          </div>
                        </Tab>
                        <Tab key="activity" title="Activity">
                          <div className="pt-5">
                            {selectedCompanyActivityQuery.isLoading ? (
                              <div className="flex items-center justify-center py-8">
                                <Spinner />
                              </div>
                            ) : activity.length === 0 ? (
                              <p className="text-sm text-default-500 py-2">No activity recorded yet.</p>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full min-w-[720px] text-sm">
                                  <thead className="bg-default-100/70">
                                    <tr>
                                      <th className="text-left px-3 py-2 font-semibold text-default-700">Event</th>
                                      <th className="text-left px-3 py-2 font-semibold text-default-700">Description</th>
                                      <th className="text-left px-3 py-2 font-semibold text-default-700">Time</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {activity.map((row: any, idx: number) => (
                                      <tr
                                        key={row?._id || idx}
                                        className={`border-t border-default-200/70 ${idx % 2 ? "bg-default-50/30 dark:bg-default-100/5" : ""}`}
                                      >
                                        <td className="px-3 py-2 font-medium text-foreground">{toText(row?.type || row?.action, "Update")}</td>
                                        <td className="px-3 py-2 text-default-600">{toText(row?.description || row?.message, "No description")}</td>
                                        <td className="px-3 py-2 text-default-600">{dayjs(row?.createdAt || row?.timestamp).format("DD MMM YYYY, hh:mm A")}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </Tab>
                      </Tabs>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isAssignModalOpen}
        onOpenChange={setIsAssignModalOpen}
        isDismissable={false}
      >
        <ModalContent>
          <ModalHeader>Assign Operator</ModalHeader>
          <ModalBody>
            <div className="space-y-2">
              <p className="text-sm text-default-600">
                Company: <span className="font-semibold text-foreground">{selectedCompanyName}</span>
              </p>
              <p className="text-xs text-default-500">
                Choose an approved active operator for this company.
              </p>
            </div>
            <Autocomplete
              label="Operator"
              labelPlacement="outside"
              placeholder="Search operator by name or email"
              selectedKey={selectedOperatorId || null}
              inputValue={operatorSearchText}
              onInputChange={setOperatorSearchText}
              onSelectionChange={(key) => setSelectedOperatorId(String(key || ""))}
              isDisabled={!isAdmin}
            >
              {filteredOperatorOptions.map((option) => (
                <AutocompleteItem key={option.id} textValue={`${option.name} ${option.email}`}>
                  <div className="flex flex-col">
                    <span className="font-medium">{option.name}</span>
                    <span className="text-xs text-default-500">{option.email || "-"}</span>
                  </div>
                </AutocompleteItem>
              ))}
            </Autocomplete>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="flat"
              color="danger"
              isDisabled={!isAdmin || assignOperatorMutation.isPending || !selectedCompanyAssignedOperatorId}
              onPress={() => assignOperatorMutation.mutate(null)}
            >
              Unassign
            </Button>
            <Button
              color="primary"
              isLoading={assignOperatorMutation.isPending}
              isDisabled={!isAdmin || !selectedOperatorId}
              onPress={() => assignOperatorMutation.mutate(selectedOperatorId)}
            >
              Save Assignment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
