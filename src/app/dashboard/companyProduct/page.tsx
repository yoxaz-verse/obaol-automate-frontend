"use client";

import React, { useMemo, useState, useContext, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Avatar,
  Tabs as HeroTabs,
  Tab as HeroTab,
  Chip as HeroChip,
  Select as HeroSelect,
  SelectItem,
  Button,
  Input,
  Textarea,
  Switch as HeroSwitch,
  Divider as HeroDivider,
} from "@heroui/react";

const Tabs = HeroTabs as any;
const Tab = HeroTab as any;
const Chip = HeroChip as any;
const Select = HeroSelect as any;
const Switch = HeroSwitch as any;
const Divider = HeroDivider as any;
import { LuGlobe, LuMail, LuPhone, LuMapPin, LuLinkedin, LuFacebook, LuTwitter, LuInstagram, LuImage, LuBriefcase, LuTags, LuLayoutDashboard, LuPlus, LuExternalLink, LuInfo, LuCopy, LuChevronLeft, LuChevronRight, LuSearch } from "react-icons/lu";
import { FiEdit2 } from "react-icons/fi";
import VariantRate from "@/components/dashboard/Catalog/variant-rate";
import AddModal from "@/components/CurdTable/add-model";
import { motion } from "framer-motion";
import AuthContext from "@/context/AuthContext";
import { getData, patchData } from "@/core/api/apiHandler";
import {
  associateCompanyRoutes,
  variantRateRoutes,
  operatorRoutes,
  associateRoutes,
} from "@/core/api/apiRoutes";
import BrandedLoader from "@/components/ui/BrandedLoader";
import { FormField } from "@/data/interface-data";
import { formatLastSeen, getPresenceStatus, isOnline } from "@/utils/presence";
import { fetchDependentOptions } from "@/utils/fetchDependentOptions";

interface Company {
  _id: string;
  name: string;
  assignedOperator?: any;
  stats?: {
    totalProducts: number;
    liveProducts: number;
  };
  logo?: string;
  banner?: string;
  description?: string;
  aboutUs?: string;
  address?: string;
  website?: string;
  socialLinks?: {
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  tags?: string[];
  subdomain?: string;
  customDomain?: string;
  isWebsiteLive?: boolean;
}

export default function CompanyProductPage() {
  const { user } = useContext(AuthContext);
  const roleLower = String(user?.role || "").toLowerCase();
  const isOperatorUser = roleLower === "operator" || roleLower === "team";
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("live"); // "live", "active", "empty", "dormant"
  const [detailTab, setDetailTab] = useState<string>("products"); // "products", "details", "associates", "web"
  const [companySearch, setCompanySearch] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [isEditingWeb, setIsEditingWeb] = useState(false);
  const [selectedOperatorId, setSelectedOperatorId] = useState<string | null>(null);
  const [webFields, setWebFields] = useState<any>({});
  const [aboutUsError, setAboutUsError] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const companyIdParam = searchParams.get("companyId");
  const ABOUT_US_MIN = 120;
  const ABOUT_US_MAX = 800;

  const operatorAssociateFormFields: FormField[] = [
    { label: "Associate Name", type: "text", key: "name", inForm: true, inTable: false, required: true },
    { label: "Email", type: "email", key: "email", inForm: true, inTable: false, required: true },
    { label: "Phone", type: "number", key: "phone", inForm: true, inTable: false, required: true },
    { label: "Phone Secondary", type: "number", key: "phoneSecondary", inForm: true, inTable: false, required: false },
    {
      label: "Designation",
      type: "select",
      key: "designation",
      values: [],
      dynamicValuesFn: () => fetchDependentOptions("designation"),
      inForm: true,
      inTable: false,
      required: true,
    },
    {
      label: "Associate Company",
      type: "select",
      key: "associateCompany",
      values: [],
      dynamicValuesFn: () =>
        fetchDependentOptions("associateCompany", undefined, undefined, {
          mode: "associateForm",
        }),
      inForm: true,
      inTable: false,
      required: true,
    },
    { label: "Address", type: "text", key: "address", inForm: true, inTable: false, required: true },
    {
      label: "Geo Type",
      type: "select",
      key: "geoType",
      values: [
        { key: "INDIAN", value: "Indian" },
        { key: "INTERNATIONAL", value: "International" },
      ],
      inForm: true,
      inTable: false,
      required: true,
    },
    {
      label: "Country",
      type: "select",
      key: "country",
      values: [],
      dynamicValuesFn: () => fetchDependentOptions("country"),
      inForm: true,
      inTable: false,
      required: true,
      showWhen: { key: "geoType", equals: "INTERNATIONAL" },
    },
    {
      label: "State",
      type: "select",
      key: "state",
      values: [],
      dynamicValuesFn: () => fetchDependentOptions("state"),
      inForm: true,
      inTable: false,
      required: true,
      showWhen: { key: "geoType", equals: "INDIAN" },
    },
    {
      label: "District",
      type: "select",
      key: "district",
      dependsOn: "state",
      values: [],
      dynamicValuesFn: (stateId: string) => fetchDependentOptions("district", "state", stateId),
      inForm: true,
      inTable: false,
      required: true,
      showWhen: { key: "geoType", equals: "INDIAN" },
    },
    {
      label: "Division",
      type: "select",
      key: "division",
      dependsOn: "district",
      values: [],
      dynamicValuesFn: (districtId: string) => fetchDependentOptions("division", "district", districtId),
      inForm: true,
      inTable: false,
      required: true,
      showWhen: { key: "geoType", equals: "INDIAN" },
    },
    {
      label: "Pin Code",
      type: "select",
      key: "pincodeEntry",
      dependsOn: "division",
      values: [],
      dynamicValuesFn: (divisionId: string) => fetchDependentOptions("pincodeEntry", "division", divisionId),
      inForm: true,
      inTable: false,
      required: true,
      showWhen: { key: "geoType", equals: "INDIAN" },
    },
    {
      label: "Contact Preference",
      type: "select",
      key: "onboardingContactPreference",
      values: [
        { key: "phone", value: "Phone" },
        { key: "email", value: "Email" },
      ],
      inForm: true,
      inTable: false,
      required: false,
    },
    { label: "Contact Notes", type: "textarea", key: "onboardingContactNotes", inForm: true, inTable: false, required: false },
    { label: "Password", type: "password", key: "password", inForm: true, inTable: false, required: true },
  ];

  const operatorCompanyFormFields: FormField[] = [
    { label: "Company Name", type: "text", key: "name", inForm: true, inTable: false, required: true },
    { label: "Email", type: "email", key: "email", inForm: true, inTable: false, required: true },
    { label: "Phone", type: "number", key: "phone", inForm: true, inTable: false, required: true },
    { label: "Phone Secondary", type: "number", key: "phoneSecondary", inForm: true, inTable: false, required: true },
    {
      label: "Company Type",
      type: "select",
      key: "companyType",
      values: [],
      dynamicValuesFn: () => fetchDependentOptions("companyType"),
      inForm: true,
      inTable: false,
      required: true,
    },
    {
      label: "Geo Type",
      type: "select",
      key: "geoType",
      values: [
        { key: "INDIAN", value: "Indian" },
        { key: "INTERNATIONAL", value: "International" },
      ],
      inForm: true,
      inTable: false,
      required: true,
    },
    {
      label: "Country",
      type: "select",
      key: "country",
      values: [],
      dynamicValuesFn: () => fetchDependentOptions("country"),
      inForm: true,
      inTable: false,
      required: true,
      showWhen: { key: "geoType", equals: "INTERNATIONAL" },
    },
    {
      label: "State",
      type: "select",
      key: "state",
      values: [],
      dynamicValuesFn: () => fetchDependentOptions("state"),
      inForm: true,
      inTable: false,
      required: true,
      showWhen: { key: "geoType", equals: "INDIAN" },
    },
    {
      label: "District",
      type: "select",
      key: "district",
      dependsOn: "state",
      values: [],
      dynamicValuesFn: (stateId: string) => fetchDependentOptions("district", "state", stateId),
      inForm: true,
      inTable: false,
      required: true,
      showWhen: { key: "geoType", equals: "INDIAN" },
    },
    {
      label: "Division",
      type: "select",
      key: "division",
      dependsOn: "district",
      values: [],
      dynamicValuesFn: (districtId: string) => fetchDependentOptions("division", "district", districtId),
      inForm: true,
      inTable: false,
      required: true,
      showWhen: { key: "geoType", equals: "INDIAN" },
    },
    {
      label: "Pin Code",
      type: "select",
      key: "pincodeEntry",
      dependsOn: "division",
      values: [],
      dynamicValuesFn: (divisionId: string) => fetchDependentOptions("pincodeEntry", "division", divisionId),
      inForm: true,
      inTable: false,
      required: true,
      showWhen: { key: "geoType", equals: "INDIAN" },
    },
    { label: "Address", type: "text", key: "address", inForm: true, inTable: false, required: true },
    {
      label: "GSTIN",
      type: "text",
      key: "gstin",
      inForm: true,
      inTable: false,
      required: false,
      showWhen: { key: "geoType", equals: "INDIAN" },
    },
    {
      label: "Legal Registration Number",
      type: "text",
      key: "legalRegistrationNumber",
      inForm: true,
      inTable: false,
      required: true,
      showWhen: { key: "geoType", equals: "INTERNATIONAL" },
    },
    {
      label: "Legal Compliance Info",
      type: "textarea",
      key: "legalComplianceInfo",
      inForm: true,
      inTable: false,
      required: true,
      showWhen: { key: "geoType", equals: "INTERNATIONAL" },
    },
    {
      label: "Service Capabilities",
      type: "multiselect",
      key: "serviceCapabilities",
      values: [
        { key: "PROCUREMENT", value: "Procurement" },
        { key: "CERTIFICATION", value: "Certification" },
        { key: "TRANSPORTATION", value: "Transportation" },
        { key: "SHIPPING", value: "Freight Forwarding & Shipping" },
        { key: "PACKAGING", value: "Packaging" },
        { key: "QUALITY_TESTING", value: "Quality Testing & Assurance" },
      ],
      inForm: true,
      inTable: false,
      required: false,
    },
  ];

  const { data: companyData, isLoading: loadingCompanies } = useQuery({
    queryKey: ["associateCompany", associateCompanyRoutes.getAll],
    queryFn: () => getData(associateCompanyRoutes.getAll, { limit: 3000 }),
  });

  const { data: associatesData, refetch: refetchAssociates } = useQuery({
    queryKey: ["associates", selectedCompanyId],
    queryFn: () => getData(associateRoutes.getAll, { associateCompany: selectedCompanyId, limit: 200 }),
    enabled: !!selectedCompanyId && detailTab === "associates",
  });

  const { data: operatorData, isLoading: loadingOperators } = useQuery({
    queryKey: ["operators"],
    queryFn: () => getData(operatorRoutes.getAll, { limit: 3000 }),
    enabled: roleLower === "admin",
  });

  const assignMutation = useMutation({
    mutationFn: (operatorId: string | null) =>
      patchData(`${associateCompanyRoutes.getAll}/${selectedCompanyId}`, { assignedOperator: operatorId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["associateCompany"] });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      setIsAssigning(false);
    },
  });

  const setSupervisorMutation = useMutation({
    mutationFn: (associateId: string) =>
      patchData(`${associateCompanyRoutes.getAll}/${selectedCompanyId}`, { supervisor: associateId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      refetchAssociates();
    },
  });

  const updateCompanyMutation = useMutation({
    mutationFn: (data: any) =>
      patchData(`${associateCompanyRoutes.getAll}/${selectedCompanyId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      setIsEditingWeb(false);
    },
  });

  const validateAboutUs = (value: string) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) return "";
    if (trimmed.length < ABOUT_US_MIN) {
      return `About Us should be at least ${ABOUT_US_MIN} characters.`;
    }
    if (trimmed.length > ABOUT_US_MAX) {
      return `About Us should be at most ${ABOUT_US_MAX} characters.`;
    }
    return "";
  };

  const handleWebFieldChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setWebFields((prev: any) => ({
        ...prev,
        [parent]: {
          ...(prev[parent] || {}),
          [child]: value
        }
      }));
    } else {
      setWebFields((prev: any) => ({ ...prev, [field]: value }));
    }
    if (field === "aboutUs") {
      setAboutUsError(validateAboutUs(value));
    }
  };

  const startEditingWeb = () => {
    setWebFields({
      logo: selectedCompany?.logo || "",
      banner: selectedCompany?.banner || "",
      description: selectedCompany?.description || "",
      aboutUs: selectedCompany?.aboutUs || "",
      address: selectedCompany?.address || "",
      website: selectedCompany?.website || "",
      socialLinks: selectedCompany?.socialLinks || {},
      tags: selectedCompany?.tags || [],
      subdomain: selectedCompany?.subdomain || "",
      customDomain: selectedCompany?.customDomain || "",
      isWebsiteLive: selectedCompany?.isWebsiteLive || false,
    });
    setAboutUsError(validateAboutUs(selectedCompany?.aboutUs || ""));
    setIsEditingWeb(true);
  };

  const {
    allCompanies,
    liveCompanies,
    activeCompanies,
    emptyCompanies,
    dormantCompanies,
    selectedCompany,
    allOperators,
  } = useMemo(() => {
    const rawCompanies = Array.isArray(companyData?.data?.data?.data)
      ? companyData?.data?.data?.data
      : Array.isArray(companyData?.data?.data)
        ? companyData?.data?.data
        : [];
    let allCompanies: Company[] = rawCompanies || [];
    const allOperators: any[] = operatorData?.data?.data?.data || [];
    const sortByName = (list: Company[]) =>
      [...list].sort((a, b) =>
        String(a?.name || "").localeCompare(String(b?.name || ""), "en", {
          sensitivity: "base",
        })
      );

    // Role-based filtering: Operators only see assigned companies
    // Note: Backend hook also handles this, but frontend filtering is a nice double-layer for UX
    if (isOperatorUser) {
      allCompanies = allCompanies.filter(c => {
        const assignedId = typeof c.assignedOperator === "object" ? c.assignedOperator?._id : c.assignedOperator;
        return String(assignedId || "") === String(user?.id || "");
      });
    }

    // Categorize using backend-provided stats
    const live = sortByName(
      allCompanies
        .filter((c) => (c.stats?.liveProducts || 0) > 0)
        .map(c => ({ ...c, productCount: c.stats?.liveProducts }))
    );

    const active = sortByName(
      allCompanies
        .filter((c) => (c.stats?.totalProducts || 0) > 0 && (c.stats?.liveProducts || 0) === 0)
        .map(c => ({ ...c, productCount: c.stats?.totalProducts }))
    );

    const empty = sortByName(allCompanies.filter((c) => (c.stats?.totalProducts || 0) === 0));

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dormant = sortByName(
      allCompanies
        .filter((c) => (c.stats?.totalProducts || 0) > 0)
        .filter((c) => {
          const supervisorObj = typeof (c as any).supervisor === "object" ? (c as any).supervisor : null;
          const assignedObj = typeof (c as any).assignedOperator === "object" ? (c as any).assignedOperator : null;
          const lastSeenAt = supervisorObj?.lastSeenAt || assignedObj?.lastSeenAt || null;
          if (!lastSeenAt) return false;
          return new Date(lastSeenAt) <= weekAgo;
        })
        .map(c => ({ ...c, productCount: c.stats?.totalProducts }))
    );

    const selected = allCompanies.find(c => c._id === selectedCompanyId) || null;

    return {
      allCompanies: sortByName(allCompanies),
      liveCompanies: live,
      activeCompanies: active,
      emptyCompanies: empty,
      dormantCompanies: dormant,
      selectedCompany: selected,
      allOperators,
    };
  }, [companyData, operatorData, selectedCompanyId, user, isOperatorUser]);

  const displayedCompanies =
    activeTab === "live" ? liveCompanies :
      activeTab === "active" ? activeCompanies :
        activeTab === "empty" ? emptyCompanies :
          dormantCompanies;

  const filteredCompanies = useMemo(() => {
    const needle = companySearch.trim().toLowerCase();
    const baseList = needle ? allCompanies : displayedCompanies;
    const filtered = needle
      ? baseList.filter((company) =>
        String(company.name || "").toLowerCase().startsWith(needle)
      )
      : baseList;
    return [...filtered].sort((a, b) =>
      String(a?.name || "").localeCompare(String(b?.name || ""), "en", { sensitivity: "base" })
    );
  }, [allCompanies, displayedCompanies, companySearch]);

  useEffect(() => {
    if (!companyIdParam) return;
    const match = allCompanies.find((company) => String(company._id) === String(companyIdParam));
    if (match) {
      setSelectedCompanyId(String(match._id));
    }
  }, [companyIdParam, allCompanies]);

  useEffect(() => {
    if (!filteredCompanies.length) {
      if (selectedCompanyId) setSelectedCompanyId(null);
      return;
    }

    // Only auto-select if we are an operator with exactly one company assigned
    // Otherwise, let the user choose manually to avoid "automatic selection" glitches.
    if (isOperatorUser && !selectedCompanyId && allCompanies.length === 1) {
      setSelectedCompanyId(allCompanies[0]._id);
    }
  }, [activeTab, filteredCompanies, selectedCompanyId, isOperatorUser, allCompanies]);

  if (loadingCompanies) {
    return (
      <BrandedLoader message="NARRATING_CATALOG_SYNC" />
    );
  }

  const handleAssign = () => {
    assignMutation.mutate(selectedOperatorId);
  };

  const resolvePresence = (person: any) => {
    const lastSeenAt = person?.lastSeenAt || null;
    const status = person?.presenceStatus || getPresenceStatus(lastSeenAt);
    return {
      status,
      lastSeenLabel: formatLastSeen(lastSeenAt),
      online: isOnline(lastSeenAt),
    };
  };


  return (
    <div className="p-8 md:p-12 max-w-[1800px] mx-auto min-h-screen bg-transparent">
      {/* --- ELITE TOP COMMAND BAR --- */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-6">
          <div className="w-1.5 h-12 bg-warning-500 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.4)]" />
          <div className="flex flex-col">
            <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase italic leading-none">Catalog Intelligence</h1>
            <p className="text-[10px] font-bold text-default-400 uppercase tracking-[0.3em] mt-2 opacity-70">Fleet Management & Multi-Entity Product Allocation</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-foreground/[0.03] backdrop-blur-xl p-2 rounded-[2.5rem] border border-foreground/5 shadow-2xl">
          <div className="relative group min-w-[320px]">
            <LuSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-default-400 group-focus-within:text-warning-500 transition-colors z-10" size={18} />
            <Input
              value={companySearch}
              onChange={(event) => setCompanySearch(event.target.value)}
              placeholder="SEARCH ENTITY PREFIX..."
              variant="flat"
              classNames={{
                input: "font-bold text-[11px] tracking-widest uppercase pl-8",
                inputWrapper: "h-14 bg-transparent group-hover:bg-foreground/[0.02] border-none shadow-none px-6 ring-0 focus-within:ring-0",
              }}
              isClearable
              onClear={() => setCompanySearch("")}
            />
          </div>
          
          {isOperatorUser && (
            <div className="flex items-center gap-2 pr-2">
              <div className="h-8 w-[1px] bg-foreground/10 mx-2 hidden md:block" />
              <div className="flex gap-2">
                <AddModal
                  buttonLabel="ADD ASSOCIATE"
                  currentTable="associate"
                  formFields={operatorAssociateFormFields}
                  apiEndpoint={associateRoutes.getAll}
                  additionalVariable={{ hasCompany: true, companyMode: "existing" }}
                />
                <AddModal
                  buttonLabel="INITIALIZE COMPANY"
                  currentTable="associateCompany"
                  formFields={operatorCompanyFormFields}
                  apiEndpoint={associateCompanyRoutes.getAll}
                  additionalVariable={{ assignedOperator: user?.id }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 h-[calc(100vh-280px)] min-h-[700px] relative">
        {/* --- TACTICAL SIDEBAR (ENTITY LIST) --- */}
        {!isSidebarCollapsed && (
          <div className="w-full lg:w-[380px] flex flex-col gap-6 flex-shrink-0 animate-in slide-in-from-left duration-700">
            <Card className="bg-foreground/[0.01] border border-foreground/5 backdrop-blur-3xl shadow-none rounded-[3rem] h-full overflow-hidden flex flex-col">
              {/* STATUS MATRIX SELECTOR */}
              <div className="px-8 pt-10 pb-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-black text-default-400 uppercase tracking-[0.4em] italic mb-1">Entity Clusters</h3>
                  <span className="text-[10px] font-bold text-default-300 px-2 py-0.5 rounded-full border border-default-100">{allCompanies.length} TOTAL</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 bg-foreground/[0.04] p-1.5 rounded-[1.5rem] border border-foreground/5 shadow-inner">
                  {(["live", "active", "empty", "dormant"] as const).map((tab) => {
                    const count = tab === "live" ? liveCompanies.length : tab === "active" ? activeCompanies.length : tab === "empty" ? emptyCompanies.length : dormantCompanies.length;
                    const isActive = activeTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setSelectedCompanyId(null); }}
                        className={`flex items-center justify-between gap-1.5 px-4 h-10 rounded-xl transition-all duration-300 ${isActive
                          ? "bg-background text-foreground shadow-xl scale-[1.02] border border-foreground/5"
                          : "text-default-400 hover:text-foreground hover:bg-foreground/5"
                        }`}
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest">{tab === "dormant" ? "Idle" : tab}</span>
                        <Chip size="sm" variant="flat" className={`h-5 min-w-[24px] font-black text-[9px] ${isActive ? "bg-warning-500 text-black border-none" : "bg-foreground/5"}`}>{count}</Chip>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Divider className="opacity-40" />

              {/* DYNAMIC SCROLL FEED */}
              <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar group/list">
                <div className="flex flex-col gap-2">
                  {filteredCompanies.map((company) => {
                    const isActive = selectedCompanyId === company._id;
                    const prodCount = (company as any).productCount;
                    const isLive = (company.stats?.liveProducts || 0) > 0;

                    return (
                      <motion.button
                        key={company._id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedCompanyId(company._id)}
                        className={`group relative flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-300 text-left overflow-hidden ${isActive
                          ? "bg-warning-500/10 border border-warning-500/20"
                          : "border border-transparent hover:bg-foreground/[0.03]"
                        }`}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-3 bottom-3 w-1 bg-warning-500 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                        )}
                        

                        <div className="flex-1 min-w-0">
                          <div className={`font-black truncate text-xs tracking-tight uppercase leading-none transition-colors ${isActive ? "text-warning-500" : "text-foreground/80"
                            }`}>{company.name}</div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] font-bold text-default-400 uppercase tracking-widest opacity-60 italic">Nodes:</span>
                            <span className="text-[10px] font-black text-default-500 uppercase">{prodCount || "00"} Unit Payload</span>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}

                  {filteredCompanies.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-30 italic">
                      <LuInfo size={32} className="mb-4 text-default-300" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Zero Entities Detected</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* --- MAIN INTELLIGENCE HUB (DETAIL) --- */}
        <div className="flex-1 min-w-0">
          <Card className="h-full bg-foreground/[0.01] border border-foreground/5 backdrop-blur-3xl shadow-none rounded-[3rem] overflow-hidden flex flex-col min-w-0 max-w-full">
            {selectedCompany ? (
              <>
                {/* HUB HEADER */}
                <div className="px-10 py-10 border-b border-foreground/5 bg-foreground/[0.01]">
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                    {/* Entity Branding */}
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase italic leading-[0.8]">{selectedCompany.name}</h1>
                        <div className="flex items-center gap-3 mt-2">
                          <Chip
                            size="sm"
                            variant="shadow"
                            className={`font-black uppercase text-[9px] tracking-widest h-6 px-3 border-none ${activeTab === "live" ? "bg-success-500 text-black" : activeTab === "active" ? "bg-warning-500 text-black" : "bg-default-400 text-white"}`}
                          >
                            {activeTab === "live" ? "● LIVE_REACH" : activeTab === "active" ? "◌ ACTIVE_POOL" : "○ EMPTY_BUFFER"}
                          </Chip>
                          {(selectedCompany as any).state?.name && (
                            <span className="text-[10px] font-black text-default-400 uppercase tracking-widest italic opacity-60">
                              <LuMapPin className="inline mr-1" size={10} />
                              {(selectedCompany as any).state.name} Territory
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {(() => {
                        const customDomain = String(selectedCompany.customDomain || "").trim();
                        const subdomain = String(selectedCompany.subdomain || "").trim();
                        const isLive = Boolean((selectedCompany as any).isWebsiteLive);
                        const portfolioUrl = customDomain ? `https://${customDomain}` : subdomain ? `https://${subdomain}.company.obaol.com` : "";
                        if (!isLive || !portfolioUrl) return null;
                        return (
                          <Button
                            as="a"
                            href={portfolioUrl}
                            target="_blank"
                            variant="flat"
                            className="bg-foreground/5 font-black uppercase text-[10px] tracking-widest h-12 px-6 rounded-2xl"
                            endContent={<LuExternalLink size={14} />}
                          >
                            PORTFOLIO LIVE
                          </Button>
                        );
                      })()}

                      {/* Overseer Widget */}
                      {roleLower === "admin" && (
                        <div className="bg-foreground/[0.03] p-1.5 rounded-2xl border border-foreground/5 flex items-center gap-3">
                          {!isAssigning ? (
                            <div className="flex items-center gap-4 pl-3">
                              <div className="flex flex-col">
                                <span className="text-[9px] font-black text-default-400 uppercase tracking-widest leading-none">OVERSEER</span>
                                {selectedCompany.assignedOperator ? (
                                  <span className="text-xs font-black text-foreground mt-1 uppercase italic transition-all group-hover:text-warning-500">
                                    {(typeof selectedCompany.assignedOperator === 'object' ? selectedCompany.assignedOperator.name : "UNKNOWN")}
                                  </span>
                                ) : (
                                  <span className="text-xs font-black text-default-300 mt-1 uppercase italic">UNASSIGNED</span>
                                )}
                              </div>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                className="bg-foreground/5 rounded-xl hover:bg-warning-500/10 hover:text-warning-500 transition-all"
                                onClick={() => {
                                  setSelectedOperatorId(typeof selectedCompany.assignedOperator === 'object' ? selectedCompany.assignedOperator._id : null);
                                  setIsAssigning(true);
                                }}
                              >
                                <FiEdit2 size={16} />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Select
                                size="sm"
                                placeholder="Select Operator"
                                className="w-48"
                                classNames={{ trigger: "bg-transparent border-none shadow-none" }}
                                selectedKeys={selectedOperatorId ? [selectedOperatorId] : []}
                                onSelectionChange={(keys: any) => setSelectedOperatorId(Array.from(keys)[0] as string)}
                              >
                                {allOperators.map((emp) => (
                                  <SelectItem key={emp._id} textValue={emp.name} className="font-bold uppercase text-xs">
                                    {emp.name}
                                  </SelectItem>
                                ))}
                              </Select>
                              <Button 
                                size="sm" 
                                color="warning" 
                                variant="shadow" 
                                className="font-black h-9 rounded-xl px-4" 
                                isLoading={assignMutation.isPending} 
                                onClick={handleAssign}
                              >
                                {assignMutation.isPending ? "ASSIGNING" : "CONFIRM"}
                              </Button>
                              <Button isIconOnly size="sm" variant="light" className="rounded-xl" onClick={() => setIsAssigning(false)}>×</Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-10 pb-12 pt-8 custom-scrollbar min-w-0 max-w-full">
                  <div className="mb-10">
                    <Tabs
                      aria-label="Detail Sections"
                      selectedKey={detailTab}
                      onSelectionChange={(key: any) => setDetailTab(key as string)}
                      variant="underlined"
                      color="warning"
                      classNames={{
                        tabList: "gap-12 w-full relative rounded-none p-0 border-b border-foreground/5",
                        cursor: "w-full bg-warning-500 h-1 rounded-full shadow-[0_-2px_10px_rgba(234,179,8,0.5)]",
                        tab: "max-w-fit px-4 h-12",
                        tabContent: "text-[11px] font-black uppercase tracking-[0.2em] group-data-[selected=true]:text-warning-500 transition-all",
                      }}
                    >
                      <Tab key="products" title="Allocation Map" />
                      <Tab key="details" title="Entity Profile" />
                      <Tab key="associates" title="Human Resources" />
                      <Tab key="web" title="Digital Content" />
                    </Tabs>
                  </div>

                  {detailTab === "products" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      {activeTab !== "empty" ? (
                        <VariantRate
                          rate="variantRate"
                          additionalParams={{
                            associateCompany: selectedCompany._id,
                            ...(activeTab === "live" ? { isLive: true } : {})
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in duration-700">
                          <div className="relative mb-10">
                            <div className="absolute inset-0 bg-warning-500/10 blur-[50px] rounded-full" />
                            <div className="w-24 h-24 bg-foreground/[0.03] rounded-[2rem] border border-foreground/5 flex items-center justify-center relative z-10">
                              <LuTags size={32} className="text-warning-500 opacity-60" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-background rounded-xl border border-foreground/10 flex items-center justify-center shadow-lg">
                              <LuPlus className="text-warning-500" size={16} />
                            </div>
                          </div>
                          
                          <h4 className="text-2xl font-black text-foreground uppercase tracking-tight italic leading-none mb-4">Allocation Missing</h4>
                          <div className="w-12 h-1 bg-warning-500/30 rounded-full mx-auto mb-6" />
                          
                          <p className="text-default-400 text-[10px] font-bold uppercase tracking-[0.2em] max-w-[320px] leading-relaxed opacity-60">
                            No active product mappings or rate cards detected for this entity. Initialize core parameters via the Global Catalog.
                          </p>

                          <div className="mt-10 px-6 py-2 border border-foreground/5 rounded-full bg-foreground/[0.02]">
                             <span className="text-[9px] font-black text-default-300 uppercase tracking-widest italic">PROTOCOL_PENDING // AWAITING_CATALOG_SYNC</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {detailTab === "details" && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                      <Card className="p-8 border-none bg-foreground/[0.02] shadow-none rounded-[2.5rem]">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="w-1.5 h-6 bg-warning-500 rounded-full" />
                          <h3 className="text-[11px] font-black text-foreground uppercase tracking-[0.3em]">Communication Gateways</h3>
                        </div>
                        <div className="space-y-6">
                          {[
                            { label: "PRIMARY_EMAIL", value: (selectedCompany as any).email || "NOT_FOUND", icon: LuMail },
                            { label: "VOICE_LINE_01", value: (selectedCompany as any).phone || "NOT_FOUND", icon: LuPhone },
                            { label: "SEC_VOICE_LINE", value: (selectedCompany as any).phoneSecondary || "NOT_FOUND", icon: LuPhone },
                          ].map((item, idx) => (
                            <div key={idx} className="flex flex-col gap-1 group/item">
                              <span className="text-[9px] font-black text-default-400 uppercase tracking-widest leading-none flex items-center gap-2">
                                <item.icon size={10} className="text-warning-500/50" />
                                {item.label}
                              </span>
                              <span className="text-sm font-black text-foreground uppercase tracking-tight truncate group-hover/item:text-warning-500 transition-colors">
                                {item.value}
                              </span>
                            </div>
                          ))}
                          
                          {(selectedCompany as any).website && (
                             <div className="pt-4 mt-4 border-t border-foreground/5">
                              <Button
                                as="a"
                                href={(selectedCompany as any).website?.startsWith('http') ? (selectedCompany as any).website : `https://${(selectedCompany as any).website}`}
                                target="_blank"
                                variant="flat"
                                className="w-full bg-warning-500 text-black font-black uppercase text-[10px] tracking-widest h-12 rounded-xl"
                                startContent={<LuGlobe size={14} />}
                              >
                                ACCESS_PORTAL
                              </Button>
                             </div>
                          )}
                        </div>
                      </Card>

                      <Card className="p-8 border-none bg-foreground/[0.02] shadow-none rounded-[2.5rem]">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="w-1.5 h-6 bg-warning-500 rounded-full" />
                          <h3 className="text-[11px] font-black text-foreground uppercase tracking-[0.3em]">Geospatial Meta</h3>
                        </div>
                        <div className="space-y-6">
                          {[
                            { label: "STATE_PROVINCE", value: (selectedCompany as any).state?.name || "UNSET", icon: LuMapPin },
                            { label: "DISTRICT_ZONE", value: (selectedCompany as any).district?.name || "UNSET", icon: LuMapPin },
                            { label: "ENTITY_CLASSIFICATION", value: (selectedCompany as any).companyType?.name || "UNSET", icon: LuBriefcase },
                          ].map((item, idx) => (
                            <div key={idx} className="flex flex-col gap-1 group/item">
                              <span className="text-[9px] font-black text-default-400 uppercase tracking-widest leading-none flex items-center gap-2">
                                <item.icon size={10} className="text-warning-500/50" />
                                {item.label}
                              </span>
                              <span className="text-sm font-black text-foreground uppercase tracking-tight truncate">
                                {item.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </motion.div>
                  )}

                  {detailTab === "associates" && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="grid grid-cols-1 xl:grid-cols-2 gap-4"
                    >
                      {(associatesData?.data?.data?.data || []).length > 0 ? (
                        (associatesData.data.data.data as any[]).map((associate) => {
                          const isSupervisor = (selectedCompany as any).supervisor === associate._id || (selectedCompany as any).supervisor?._id === associate._id;
                          const presence = resolvePresence(associate);
                          return (
                            <motion.div key={associate._id} whileHover={{ y: -4 }}>
                              <Card className="p-6 border-none bg-foreground/[0.02] shadow-none rounded-[2rem] flex flex-row items-center justify-between gap-6 hover:bg-foreground/[0.04] transition-all">
                                <div className="flex items-center gap-4">
                                  <Avatar
                                    size="md"
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(associate.name)}&background=18181b&color=fff&bold=true`}
                                    className="w-14 h-14 rounded-2xl border border-foreground/5 shadow-xl"
                                  />
                                  <div className="flex flex-col gap-1">
                                    <div className="text-xs font-black uppercase tracking-tight flex items-center gap-2">
                                      {associate.name}
                                      {isSupervisor && (
                                        <Chip size="sm" variant="shadow" className="h-5 bg-success-500 text-black text-[8px] font-black uppercase tracking-widest border-none">CORE_SUPERVISOR</Chip>
                                      )}
                                    </div>
                                    <div className="text-[9px] font-bold text-default-400 uppercase tracking-widest opacity-70">
                                      {associate.email}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className={`w-1.5 h-1.5 rounded-full ${presence.online ? "bg-success-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-default-300"}`} />
                                      <span className="text-[9px] font-black text-default-400 uppercase italic">
                                        {presence.online ? "ACTIVE_STREAM" : `LAST_INTERACTED ${presence.lastSeenLabel}`}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant={isSupervisor ? "flat" : "ghost"}
                                  className={`h-10 px-6 rounded-xl font-black uppercase text-[9px] tracking-widest ${isSupervisor ? "bg-success-500/10 text-success-500" : "border-foreground/10 text-default-500 hover:bg-warning-500 hover:text-black hover:border-none"}`}
                                  disabled={isSupervisor}
                                  isLoading={setSupervisorMutation.isPending && setSupervisorMutation.variables === associate._id}
                                  onClick={() => setSupervisorMutation.mutate(associate._id)}
                                >
                                  {isSupervisor ? "PRIMARY_HEAD" : "SET_HEAD"}
                                </Button>
                              </Card>
                            </motion.div>
                          );
                        })
                      ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-30 italic">
                          <p className="text-[10px] font-black uppercase tracking-[0.5em]">Zero Resources In Pool</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {detailTab === "web" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                      {!isEditingWeb ? (
                        <div className="flex flex-col gap-10">
                          <div className="flex justify-between items-center bg-foreground/[0.02] p-6 rounded-[2rem] border border-foreground/5">
                            <div className="flex flex-col">
                              <h3 className="text-[11px] font-black text-foreground uppercase tracking-[0.3em]">Web_Asset_Intelligence</h3>
                              <p className="text-[9px] font-bold text-default-400 uppercase mt-1">Global digital presence & SEO mapping</p>
                            </div>
                            <div className="flex gap-3">
                              <Button
                                size="sm"
                                color="warning"
                                variant="shadow"
                                onClick={startEditingWeb}
                                className="font-black uppercase text-[10px] tracking-widest h-10 px-6 rounded-xl"
                                startContent={<LuLayoutDashboard size={14} />}
                              >
                                OVERRIDE_CONTENT
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <Card className="md:col-span-1 p-8 border-none bg-foreground/[0.02] shadow-none rounded-[3rem] flex flex-col items-center gap-6 group">
                              <div className="text-[9px] font-black text-default-400 uppercase tracking-widest w-full">IDENTITY_ASSETS</div>
                              <div className="relative">
                                <Avatar
                                  size="xl"
                                  src={selectedCompany?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCompany?.name || "")}&background=18181b&color=fff&size=256&bold=true`}
                                  className="w-32 h-32 rounded-[2.5rem] border-4 border-background shadow-2xl group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute -bottom-2 -right-2 bg-success-500 w-6 h-6 rounded-full border-4 border-background shadow-lg" />
                              </div>
                              <div className="w-full h-40 rounded-[2rem] bg-foreground/5 overflow-hidden relative border border-foreground/5">
                                {selectedCompany?.banner ? (
                                  <img src={selectedCompany.banner} alt="Banner" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-default-300 gap-2">
                                    <LuImage size={24} className="opacity-20" />
                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40 italic">NO_BANNER_DETECTED</span>
                                  </div>
                                )}
                              </div>
                            </Card>

                            <Card className="md:col-span-2 p-10 border-none bg-foreground/[0.02] shadow-none rounded-[3rem] flex flex-col gap-10">
                              <div className="flex flex-col gap-2">
                                <div className="text-[9px] font-black text-default-400 uppercase tracking-widest">TACTICAL_TAGLINE</div>
                                <p className="text-xl font-black text-foreground uppercase tracking-tight italic leading-tight">"{selectedCompany?.description || "QUALITY_SOURCE_UNDEFINED"}"</p>
                              </div>
                              <div className="flex flex-col gap-2">
                                <div className="text-[9px] font-black text-default-400 uppercase tracking-widest">ENTITY_SYNOPSIS</div>
                                <p className="text-xs font-bold text-default-500 uppercase tracking-wider leading-relaxed opacity-80">{selectedCompany?.aboutUs || "BIO_DATA_MISSING_IN_CORE_REPOSITORY"}</p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {selectedCompany?.tags?.map((tag: string) => (
                                  <Chip key={tag} size="sm" variant="flat" className="bg-warning-500/10 text-warning-500 font-black uppercase text-[8px] tracking-widest h-6 border none"># {tag}</Chip>
                                )) || <span className="text-[9px] font-black text-default-300 uppercase italic">ZERO_TAGS_LINKED</span>}
                              </div>
                            </Card>
                          </div>

                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <Card className="p-8 border-none bg-foreground/[0.02] shadow-none rounded-[2.5rem] flex flex-col gap-8">
                               <div className="text-[9px] font-black text-default-400 uppercase tracking-widest">SOCIAL_SIGNAL_MATRIX</div>
                               <div className="grid grid-cols-2 gap-6">
                                  {[
                                    { icon: LuGlobe, label: "MAIN_DOMAIN", value: selectedCompany?.website },
                                    { icon: LuLinkedin, label: "LINKEDIN_ID", value: selectedCompany?.socialLinks?.linkedin },
                                    { icon: LuFacebook, label: "FACEBOOK_ID", value: selectedCompany?.socialLinks?.facebook },
                                    { icon: LuTwitter, label: "X_PLATFORM", value: selectedCompany?.socialLinks?.twitter },
                                  ].map((p, idx) => (
                                    <div key={idx} className="flex items-center gap-3 group/link cursor-pointer">
                                      <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center group-hover/link:bg-warning-500 transition-colors">
                                        <p.icon size={14} className="group-hover/link:text-black" />
                                      </div>
                                      <div className="flex flex-col min-w-0">
                                        <span className="text-[8px] font-black text-default-300 uppercase tracking-widest leading-none">{p.label}</span>
                                        <span className="text-[11px] font-black text-foreground uppercase truncate mt-1">{p.value || "NOT_LINKED"}</span>
                                      </div>
                                    </div>
                                  ))}
                               </div>
                            </Card>

                            <Card className="p-8 border-none bg-foreground/[0.02] shadow-none rounded-[2.5rem] flex flex-col gap-8">
                               <div className="flex justify-between items-center">
                                  <div className="text-[9px] font-black text-default-400 uppercase tracking-widest">DOMAIN_ROUTING</div>
                                  <Chip size="sm" variant="shadow" className={`h-6 text-[8px] font-black uppercase tracking-widest border-none ${selectedCompany?.isWebsiteLive ? "bg-success-500 text-black" : "bg-default-400 text-white"}`}>
                                    {selectedCompany?.isWebsiteLive ? "ACTIVE_STREAM" : "DRAFT_MODE"}
                                  </Chip>
                               </div>
                               <div className="grid grid-cols-1 gap-6">
                                  <div className="bg-background/50 p-4 rounded-2xl border border-foreground/5">
                                    <span className="text-[8px] font-black text-default-400 uppercase tracking-widest mb-1 block">OBAOL_NODE_ENDPOINT</span>
                                    <span className="text-[11px] font-black text-warning-500 uppercase tracking-widest italic">{selectedCompany?.subdomain ? `${selectedCompany.subdomain}.company.obaol.com` : "ENDPOINT_NOT_ALLOCATED"}</span>
                                  </div>
                                  <div className="bg-background/50 p-4 rounded-2xl border border-foreground/5">
                                    <span className="text-[8px] font-black text-default-400 uppercase tracking-widest mb-1 block">CUSTOM_ALIAS_DOMAIN</span>
                                    <span className="text-[11px] font-black text-foreground uppercase tracking-widest italic">{selectedCompany?.customDomain || "ALIAS_NOT_CONFIGURED"}</span>
                                  </div>
                               </div>
                            </Card>
                          </div>

                          <Card className="p-8 border-none bg-foreground/[0.02] shadow-none rounded-[2.5rem] flex flex-col gap-8">
                            <div className="text-[9px] font-black text-default-400 uppercase tracking-widest">PORTFOLIO_LINKS</div>
                            <div className="space-y-6">
                              {(() => {
                                const customDomain = String(selectedCompany?.customDomain || "").trim();
                                const subdomain = String(selectedCompany?.subdomain || "").trim();
                                const brandUrl = customDomain
                                  ? `https://${customDomain}`
                                  : subdomain
                                    ? `https://${subdomain}.company.obaol.com`
                                    : "";
                                const brandPreviewUrl = subdomain ? `https://obaol.com/brand/${subdomain}` : "";
                                return (
                                  <div className="space-y-2">
                                    <div className="text-[11px] font-semibold text-foreground/80">Brand Page</div>
                                    {brandUrl ? (
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[11px] font-mono bg-default-100 px-2 py-1 rounded border border-divider">
                                          {brandUrl}
                                        </span>
                                        <a
                                          href={brandUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-warning-500 hover:text-warning-600"
                                        >
                                          <LuExternalLink className="w-3.5 h-3.5" />
                                          Open
                                        </a>
                                        <button
                                          type="button"
                                          onClick={() => navigator.clipboard?.writeText(brandUrl)}
                                          className="inline-flex items-center gap-1 text-default-500 hover:text-default-700"
                                        >
                                          <LuCopy className="w-3.5 h-3.5" />
                                          Copy
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="text-[11px] text-default-400 italic">Not configured (set subdomain or custom domain).</div>
                                    )}
                                    {brandPreviewUrl && (
                                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-default-500">
                                        <span className="font-mono bg-default-50 px-2 py-1 rounded border border-default-200/60">
                                          {brandPreviewUrl}
                                        </span>
                                        <span className="text-[10px] text-default-400">Preview on main domain</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                              {(() => {
                                const slug = String((selectedCompany as any)?.slug || "").trim();
                                const catalogUrl = slug ? `https://obaol.com/obaol/${slug}` : "";
                                return (
                                  <div className="space-y-2">
                                    <div className="text-[11px] font-semibold text-foreground/80">Company Catalog Page</div>
                                    {catalogUrl ? (
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[11px] font-mono bg-default-100 px-2 py-1 rounded border border-divider">
                                          {catalogUrl}
                                        </span>
                                        <a
                                          href={catalogUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-warning-500 hover:text-warning-600"
                                        >
                                          <LuExternalLink className="w-3.5 h-3.5" />
                                          Open
                                        </a>
                                        <button
                                          type="button"
                                          onClick={() => navigator.clipboard?.writeText(catalogUrl)}
                                          className="inline-flex items-center gap-1 text-default-500 hover:text-default-700"
                                        >
                                          <LuCopy className="w-3.5 h-3.5" />
                                          Copy
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="text-[11px] text-default-400 italic">Not configured (company slug missing).</div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </Card>
                        </div>
                      ) : (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                          {/* CONTROL CONSOLE */}
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-foreground/[0.03] p-6 rounded-[2rem] border border-foreground/5 mb-6">
                            <div className="flex flex-col">
                              <h3 className="text-xl font-black text-foreground uppercase tracking-tight italic leading-none">Content Optimizer</h3>
                              <p className="text-[9px] font-bold text-default-400 uppercase mt-2 tracking-widest">Fine-tune entity assets and digital metadata</p>
                            </div>
                            <div className="flex gap-3">
                              <Button size="sm" variant="flat" onClick={() => setIsEditingWeb(false)} className="h-10 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest">Abort</Button>
                              <Button
                                size="sm"
                                color="warning"
                                variant="shadow"
                                isLoading={updateCompanyMutation.isPending}
                                onClick={() => {
                                  const nextError = validateAboutUs(webFields.aboutUs || "");
                                  setAboutUsError(nextError);
                                  if (nextError) return;
                                  updateCompanyMutation.mutate(webFields);
                                }}
                                className="h-10 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest"
                              >
                                {updateCompanyMutation.isPending ? "Syncing..." : "Execute Sync"}
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* VISUAL ASSETS SECTION */}
                            <div className="lg:col-span-4 space-y-6">
                              <Card className="p-6 border-none bg-foreground/[0.02] shadow-none rounded-[2rem] space-y-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-1 h-4 bg-warning-500 rounded-full" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">Visual Assets</span>
                                </div>
                                
                                <div className="space-y-4">
                                  {[
                                    { label: "Logo URL", key: "logo", icon: LuImage },
                                    { label: "Banner URL", key: "banner", icon: LuImage },
                                  ].map((field) => (
                                    <Input
                                      key={field.key}
                                      label={field.label}
                                      value={webFields[field.key]}
                                      onValueChange={(val) => handleWebFieldChange(field.key, val)}
                                      size="sm"
                                      labelPlacement="outside"
                                      variant="flat"
                                      classNames={{
                                        input: "font-bold text-[10px] tracking-wider",
                                        inputWrapper: "h-10 bg-foreground/5 hover:bg-foreground/10 border-none rounded-xl transition-all",
                                        label: "text-[9px] font-black uppercase tracking-widest opacity-60 mb-2 ml-1"
                                      }}
                                      startContent={<field.icon className="text-warning-500/40" size={14} />}
                                    />
                                  ))}
                                </div>

                                {/* PREVIEW MINI-WIDGET */}
                                <div className="space-y-3 pt-2">
                                  <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">Live Preview Check</span>
                                  <div className="relative h-20 bg-foreground/[0.03] rounded-xl overflow-hidden border border-foreground/5 group">
                                     {webFields.banner ? (
                                       <img src={webFields.banner} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" alt="Preview"/>
                                     ) : (
                                       <div className="absolute inset-0 flex items-center justify-center opacity-10"><LuImage size={24}/></div>
                                     )}
                                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                        <Avatar 
                                          src={webFields.logo} 
                                          size="sm" 
                                          className="w-10 h-10 border-2 border-background shadow-xl rounded-lg"
                                        />
                                     </div>
                                  </div>
                                </div>
                              </Card>

                              <Card className="p-6 border-none bg-foreground/[0.02] shadow-none rounded-[2rem] space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-1 h-4 bg-warning-500 rounded-full" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">Connectivity</span>
                                </div>
                                <Input
                                  label="Official Website"
                                  placeholder="https://..."
                                  value={webFields.website}
                                  onValueChange={(val) => handleWebFieldChange("website", val)}
                                  size="sm"
                                  labelPlacement="outside"
                                  variant="flat"
                                  classNames={{
                                    input: "font-bold text-[10px]",
                                    inputWrapper: "h-10 bg-foreground/5 border-none rounded-xl",
                                    label: "text-[9px] font-black uppercase tracking-widest opacity-60 mb-2 ml-1"
                                  }}
                                  startContent={<LuGlobe className="text-warning-500/40" size={14} />}
                                />
                              </Card>
                            </div>

                            {/* CORE METADATA SECTION */}
                            <div className="lg:col-span-8 space-y-6">
                              <Card className="p-8 border-none bg-foreground/[0.02] shadow-none rounded-[2.5rem] space-y-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-1 h-4 bg-warning-500 rounded-full" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">Corporate Narrative</span>
                                </div>
                                
                                <Input
                                  label="Strategic Tagline"
                                  placeholder="Global market recognition tagline..."
                                  value={webFields.description}
                                  onValueChange={(val) => handleWebFieldChange("description", val)}
                                  size="md"
                                  labelPlacement="outside"
                                  variant="flat"
                                  classNames={{
                                    input: "font-black text-xs uppercase italic tracking-tight",
                                    inputWrapper: "h-12 bg-foreground/5 border-none rounded-xl",
                                    label: "text-[9px] font-black uppercase tracking-widest opacity-60 mb-2 ml-1"
                                  }}
                                />

                                <Textarea
                                  label="Primary Bio"
                                  placeholder="Operations synopsis..."
                                  value={webFields.aboutUs}
                                  onValueChange={(val) => handleWebFieldChange('aboutUs', val)}
                                  size="md"
                                  labelPlacement="outside"
                                  minRows={4}
                                  variant="flat"
                                  classNames={{
                                    input: "font-bold text-xs leading-relaxed uppercase tracking-wider",
                                    inputWrapper: "bg-foreground/5 border-none rounded-2xl p-4",
                                    label: "text-[9px] font-black uppercase tracking-widest opacity-60 mb-2 ml-1"
                                  }}
                                  isInvalid={Boolean(aboutUsError)}
                                  errorMessage={aboutUsError}
                                />
                                
                                <div className="pt-4 space-y-4">
                                  <span className="text-[9px] font-black uppercase tracking-widest opacity-60 ml-1">Social Signal Integrations</span>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                      { label: "LinkedIn", key: "socialLinks.linkedin", icon: LuLinkedin },
                                      { label: "Facebook", key: "socialLinks.facebook", icon: LuFacebook },
                                      { label: "Twitter", key: "socialLinks.twitter", icon: LuTwitter },
                                      { label: "Instagram", key: "socialLinks.instagram", icon: LuInstagram },
                                    ].map((s) => (
                                      <Input
                                        key={s.key}
                                        label={s.label}
                                        value={s.key.includes('.') ? webFields.socialLinks?.[s.key.split('.')[1]] : webFields[s.key]}
                                        onValueChange={(val) => handleWebFieldChange(s.key, val)}
                                        size="sm"
                                        labelPlacement="outside"
                                        variant="flat"
                                        classNames={{
                                          input: "font-bold text-[10px] uppercase",
                                          inputWrapper: "h-10 bg-foreground/5 border-none rounded-xl",
                                          label: "text-[8px] font-black uppercase tracking-widest opacity-40 mb-1 ml-1"
                                        }}
                                        startContent={<s.icon className="text-default-400" size={12} />}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </Card>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-20 animate-in fade-in zoom-in duration-1000">
                <div className="relative mb-12">
                   <div className="absolute inset-0 bg-warning-500 blur-[80px] opacity-20 animate-pulse rounded-full" />
                   <div className="w-40 h-40 bg-foreground/[0.03] backdrop-blur-3xl rounded-[3rem] border border-foreground/5 flex items-center justify-center relative z-10 shadow-2xl">
                    <LuBriefcase className="w-16 h-16 text-warning-500 opacity-80" />
                   </div>
                   <div className="absolute -top-4 -right-4 w-12 h-12 bg-background rounded-2xl border border-foreground/10 flex items-center justify-center shadow-xl animate-bounce">
                     <LuSearch className="text-warning-500" size={24} />
                   </div>
                </div>
                
                <h3 className="text-5xl font-black text-foreground uppercase tracking-tighter italic leading-none mb-6">AWAITING_SELECTION</h3>
                <div className="w-20 h-1.5 bg-warning-500 rounded-full mx-auto mb-8 shadow-[0_0_20px_rgba(234,179,8,0.4)]" />
                
                <p className="text-default-400 max-w-[480px] mx-auto text-xs font-bold uppercase tracking-[0.2em] leading-relaxed opacity-60">
                  {activeTab === "live"
                    ? "Establish a connection with an active market entity to initialize product parameter management and real-time rate oversight."
                    : activeTab === "active"
                      ? "Select a validated entity from the active pool to begin the transition into full market reach and product finalization."
                      : "Engage with an uninitialized entity to commence the primary product allocation cycle and digital branding setup."}
                </p>
                
                <div className="mt-12 flex items-center gap-4 bg-foreground/[0.03] px-6 py-3 rounded-full border border-foreground/5 italic">
                  <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-default-400 uppercase tracking-widest">SYSTEM_READY // READY_FOR_ENTITY_INPUT</span>
                </div>
              </div>
            )}
          </Card>
        </div>

      </div>
      <div className="h-6" />
    </div>
  );
}
