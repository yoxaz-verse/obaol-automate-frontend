"use client";

import React, { useMemo, useState, useContext, useEffect } from "react";
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
} from "@heroui/react";

const Tabs = HeroTabs as any;
const Tab = HeroTab as any;
const Chip = HeroChip as any;
const Select = HeroSelect as any;
const Switch = HeroSwitch as any;
import { LuGlobe, LuMail, LuPhone, LuMapPin, LuLinkedin, LuFacebook, LuTwitter, LuInstagram, LuImage, LuBriefcase, LuTags, LuLayoutDashboard, LuExternalLink, LuInfo, LuCopy, LuChevronLeft, LuChevronRight } from "react-icons/lu";
import VariantRate from "@/components/dashboard/Catalog/variant-rate";
import AddModal from "@/components/CurdTable/add-model";
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
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("live"); // "live", "active", "empty", "dormant"
  const [detailTab, setDetailTab] = useState<string>("products"); // "products", "details", "associates", "web"
  const [companySearch, setCompanySearch] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [isEditingWeb, setIsEditingWeb] = useState(false);
  const [selectedOperatorId, setSelectedOperatorId] = useState<string | null>(null);
  const [webFields, setWebFields] = useState<any>({});
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
    queryFn: () => getData(associateCompanyRoutes.getAll, { limit: 300 }),
  });

  const { data: associatesData, refetch: refetchAssociates } = useQuery({
    queryKey: ["associates", selectedCompanyId],
    queryFn: () => getData(associateRoutes.getAll, { associateCompany: selectedCompanyId, limit: 200 }),
    enabled: !!selectedCompanyId && detailTab === "associates",
  });

  const { data: operatorData, isLoading: loadingOperators } = useQuery({
    queryKey: ["operators"],
    queryFn: () => getData(operatorRoutes.getAll, { limit: 300 }),
    enabled: roleLower === "admin",
  });

  const assignMutation = useMutation({
    mutationFn: (operatorId: string | null) =>
      patchData(`${associateCompanyRoutes.getAll}/${selectedCompanyId}`, { assignedOperator: operatorId }),
    onSuccess: () => {
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
    if (!needle) return displayedCompanies;
    return allCompanies.filter((company) =>
      String(company.name || "").toLowerCase().includes(needle)
    );
  }, [allCompanies, displayedCompanies, companySearch]);

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
      <BrandedLoader message="Loading company catalog" />
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
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      {isOperatorUser && (
        <Card className="mb-4 p-4 bg-background/60 backdrop-blur-md border-none shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-default-500">Onboarding Actions</div>
              <p className="text-xs text-default-500 mt-0.5">
                Add associates and companies with full registration details.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <AddModal
                buttonLabel="Add Associate to Company"
                currentTable="associate"
                formFields={operatorAssociateFormFields}
                apiEndpoint={associateRoutes.getAll}
                additionalVariable={{
                  hasCompany: true,
                  companyMode: "existing",
                }}
              />
              <AddModal
                buttonLabel="Add Company"
                currentTable="associateCompany"
                formFields={operatorCompanyFormFields}
                apiEndpoint={associateCompanyRoutes.getAll}
                additionalVariable={{
                  assignedOperator: user?.id,
                }}
              />
            </div>
          </div>
        </Card>
      )}
      <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-180px)] min-h-[600px] relative">
        <Button
          isIconOnly
          variant="flat"
          size="sm"
          className={`absolute top-4 z-20 transition-all duration-300 dark:bg-default-100/30 border border-default-200/70 dark:border-default-500/40 ${isSidebarCollapsed ? "-left-3" : "left-[285px] lg:left-[325px]"}`}
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        >
          {isSidebarCollapsed ? <LuChevronRight size={16} /> : <LuChevronLeft size={16} />}
        </Button>

        {/* --- Sidebar (Master) --- */}
        {!isSidebarCollapsed && (
          <div className="w-full md:w-[300px] lg:w-[340px] flex flex-col gap-3 flex-shrink-0 transition-all duration-300 animate-in slide-in-from-left duration-300">
            <Card className="bg-content1 border border-default-200/80 shadow-sm h-full overflow-hidden flex flex-col">
              {/* Sidebar header */}
              <div className="px-4 pt-4 pb-3 border-b border-default-100">
                <h2 className="text-sm font-bold text-foreground/90 tracking-tight mb-3">Companies</h2>
                <Input
                  value={companySearch}
                  onChange={(event) => setCompanySearch(event.target.value)}
                  placeholder="Search company name"
                  size="sm"
                  variant="bordered"
                  classNames={{
                    inputWrapper: "bg-background/50 border-default-200/70",
                  }}
                  isClearable
                  onClear={() => setCompanySearch("")}
                />
              </div>

              {/* Filter tabs */}
              <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b border-default-100">
                {(["live", "active", "empty", "dormant"] as const).map((tab) => {
                  const count = tab === "live" ? liveCompanies.length : tab === "active" ? activeCompanies.length : tab === "empty" ? emptyCompanies.length : dormantCompanies.length;
                  const dotColor = tab === "live" ? "bg-success-500" : tab === "active" ? "bg-warning-500" : tab === "empty" ? "bg-default-400" : "bg-danger-500";
                  return (
                    <button
                      key={tab}
                      onClick={() => { setActiveTab(tab); setSelectedCompanyId(null); }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${activeTab === tab
                        ? "bg-default-200 text-foreground"
                        : "text-default-500 hover:text-foreground hover:bg-default-100"
                        }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                      <span className="capitalize">{tab === "dormant" ? "Dormant (7d)" : tab}</span>
                      <span className={`text-[10px] font-bold px-1 rounded ${activeTab === tab ? "bg-foreground/10" : "bg-default-200/60"
                        }`}>{count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto px-3 pb-3 custom-scrollbar">
                <div className="flex flex-col gap-1">
                  {filteredCompanies.map((company) => {
                    const isActive = selectedCompanyId === company._id;
                    const prodCount = (company as any).productCount;
                    const isLive = (company.stats?.liveProducts || 0) > 0;
                    const isDormant = activeTab === "dormant";

                    return (
                      <button
                        key={company._id}
                        onClick={() => setSelectedCompanyId(company._id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${isActive
                          ? "bg-warning-500/10 border border-warning-500/30"
                          : "border border-transparent hover:bg-default-100/80"
                          }`}
                      >
                        <Avatar
                          size="sm"
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=random&color=fff&bold=true`}
                          className="flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold truncate text-xs ${isActive ? "text-warning-600 dark:text-warning-400" : "text-foreground/80"
                            }`}>{company.name}</div>
                          {activeTab !== "empty" && (
                            <div className="text-[10px] text-default-400 mt-0.5">
                              {prodCount} {activeTab === "live" ? "live" : "products"}
                            </div>
                          )}
                        </div>
                        {isDormant ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-danger-500 shrink-0" />
                        ) : isLive ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-success-500 shrink-0" />
                        ) : null}
                      </button>
                    );
                  })}
                  {filteredCompanies.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 opacity-50">
                      <svg className="w-8 h-8 text-default-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-xs italic">No companies here.</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* --- Main Content (Detail) --- */}
        <div className="flex-1 min-w-0">
          <Card className="h-full bg-content1 border border-default-200/80 shadow-sm overflow-hidden flex flex-col min-w-0 max-w-full">
            {selectedCompany ? (
              <>
                {/* Detail header */}
                <div className="px-6 py-5 border-b border-default-100">
                  <div className="flex items-start justify-between gap-4">
                    {/* Company identity */}
                    <div className="flex items-center gap-4">
                      <Avatar
                        size="lg"
                        src={selectedCompany.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCompany.name)}&background=random&color=fff&bold=true`}
                        className="border-2 border-default-200 shadow-sm shrink-0"
                      />
                      <div>
                        <h1 className="text-xl font-bold text-foreground tracking-tight leading-tight">{selectedCompany.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                          <Chip
                            size="sm"
                            variant="flat"
                            color={activeTab === "live" ? "success" : activeTab === "active" ? "warning" : activeTab === "dormant" ? "danger" : "default"}
                            className="capitalize text-[10px] font-bold h-5"
                          >
                            {activeTab === "live"
                              ? "● Live"
                              : activeTab === "active"
                                ? "◌ Active"
                                : activeTab === "dormant"
                                  ? "● Dormant"
                                  : "○ Empty"}
                          </Chip>
                          {(selectedCompany as any).state?.name && (
                            <span className="text-[10px] text-default-400">{(selectedCompany as any).state.name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {(() => {
                      const customDomain = String(selectedCompany.customDomain || "").trim();
                      const subdomain = String(selectedCompany.subdomain || "").trim();
                      const isLive = Boolean((selectedCompany as any).isWebsiteLive);
                      const portfolioUrl = customDomain
                        ? `https://${customDomain}`
                        : subdomain
                          ? `https://${subdomain}.company.obaol.com`
                          : "";
                      if (!isLive || !portfolioUrl) return null;
                      return (
                        <a
                          href={portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-default-200/70 bg-default-100/60 px-3 py-1 text-[11px] font-semibold text-default-700 hover:bg-default-200/70 dark:bg-default-50/10 dark:text-default-200"
                        >
                          View Portfolio
                        </a>
                      );
                    })()}

                    {/* Assignment widget — Admin only */}
                    {roleLower === "admin" && (
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="text-[10px] font-bold text-default-400 uppercase tracking-widest">Overseer</div>
                        {!isAssigning ? (
                          <div className="flex items-center gap-2">
                            {selectedCompany.assignedOperator ? (
                              <div className="flex items-center gap-2">
                                {(() => {
                                  const operatorObj = typeof selectedCompany.assignedOperator === "object" ? selectedCompany.assignedOperator : null;
                                  const presence = resolvePresence(operatorObj);
                                  return (
                                    <div className="flex items-center gap-2 bg-default-100 px-2.5 py-1.5 rounded-lg">
                                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${presence.online ? "bg-success-500" : "bg-default-400"}`} />
                                      <div className="flex flex-col leading-tight">
                                        <span className="text-xs font-bold text-foreground/80">{operatorObj?.name || "Unknown"}</span>
                                        <span className="text-[10px] text-default-400">{presence.online ? "Online" : `Last seen ${presence.lastSeenLabel}`}</span>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            ) : (
                              <span className="text-xs text-default-400 italic">Not assigned</span>
                            )}
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              className="text-warning-500"
                              onClick={() => {
                                setSelectedOperatorId(typeof selectedCompany.assignedOperator === 'object' ? selectedCompany.assignedOperator._id : null);
                                setIsAssigning(true);
                              }}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Select
                              size="sm"
                              placeholder="Assign Operator"
                              className="w-44"
                              selectedKeys={selectedOperatorId ? [selectedOperatorId] : []}
                              onSelectionChange={(keys: any) => setSelectedOperatorId(Array.from(keys)[0] as string)}
                            >
                              {allOperators.map((emp) => (
                                <SelectItem key={emp._id} textValue={emp.name}>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{emp.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </Select>
                            <Button size="sm" color="warning" isLoading={assignMutation.isPending} onClick={handleAssign}>Save</Button>
                            <Button size="sm" variant="light" onClick={() => setIsAssigning(false)}>Cancel</Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Operator view */}
                    {isOperatorUser && selectedCompany.assignedOperator && (
                      <div className="flex items-center gap-2 bg-success-50 dark:bg-success-900/20 px-3 py-1.5 rounded-lg border border-success-200/60 shrink-0">
                        {(() => {
                          const operatorObj = typeof selectedCompany.assignedOperator === "object" ? selectedCompany.assignedOperator : null;
                          const presence = resolvePresence(operatorObj);
                          return (
                            <>
                              <div className={`w-1.5 h-1.5 rounded-full ${presence.online ? "bg-success-500 animate-pulse" : "bg-default-400"}`} />
                              <span className="text-[10px] font-bold text-success-700 dark:text-success-300">
                                Your supervision • {presence.online ? "Online" : `Last seen ${presence.lastSeenLabel}`}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4 custom-scrollbar min-w-0 max-w-full">
                  <div className="mb-5">
                    <Tabs
                      aria-label="Detail Sections"
                      selectedKey={detailTab}
                      onSelectionChange={(key: any) => setDetailTab(key as string)}
                      variant="underlined"
                      color="warning"
                      size="sm"
                      classNames={{
                        tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                        cursor: "w-full bg-warning-500",
                        tab: "max-w-fit px-0 h-10",
                        tabContent: "text-default-500 group-data-[selected=true]:text-warning-500 font-semibold text-xs",
                      }}
                    >
                      <Tab key="products" title="Products" />
                      <Tab key="details" title="Details" />
                      <Tab key="associates" title="Associates" />
                      <Tab key="web" title="Web Content" />
                    </Tabs>
                  </div>

                  {detailTab === "products" && (
                    <>
                      {activeTab !== "empty" ? (
                        <VariantRate
                          rate="variantRate"
                          additionalParams={{
                            associateCompany: selectedCompany._id,
                            ...(activeTab === "live" ? { isLive: true } : {})
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center py-20">
                          <div className="w-16 h-16 bg-default-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-default-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <h4 className="font-bold text-foreground/80">Allocation Required</h4>
                          <p className="text-default-400 text-sm mt-1 max-w-[280px]">
                            This company has no active products or rates. Go to the Catalog to assign products.
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {detailTab === "details" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                      <Card className="p-4 border-none bg-default-50 shadow-none">
                        <div className="text-[10px] font-bold text-default-400 uppercase mb-3">Contact Information</div>
                        <div className="space-y-3">
                          <div className="flex justify-between border-b border-divider pb-2">
                            <span className="text-xs text-default-500">Email</span>
                            <span className="text-xs font-semibold">{(selectedCompany as any).email}</span>
                          </div>
                          <div className="flex justify-between border-b border-divider pb-2">
                            <span className="text-xs text-default-500">Phone</span>
                            <span className="text-xs font-semibold">{(selectedCompany as any).phone}</span>
                          </div>
                          <div className="flex justify-between border-b border-divider pb-2">
                            <span className="text-xs text-default-500">Secondary Phone</span>
                            <span className="text-xs font-semibold">{(selectedCompany as any).phoneSecondary}</span>
                          </div>
                          {(selectedCompany as any).website && (
                            <div className="flex justify-between border-b border-divider pb-2">
                              <span className="text-xs text-default-500">Website</span>
                              <a
                                href={(selectedCompany as any).website?.startsWith('http') ? (selectedCompany as any).website : `https://${(selectedCompany as any).website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-primary-500 hover:underline"
                              >
                                Visit Site
                              </a>
                            </div>
                          )}
                        </div>
                      </Card>

                      <Card className="p-4 border-none bg-default-50 shadow-none">
                        <div className="text-[10px] font-bold text-default-400 uppercase mb-3">Location & Type</div>
                        <div className="space-y-3">
                          <div className="flex justify-between border-b border-divider pb-2">
                            <span className="text-xs text-default-500">State</span>
                            <span className="text-xs font-semibold">{(selectedCompany as any).state?.name || "N/A"}</span>
                          </div>
                          <div className="flex justify-between border-b border-divider pb-2">
                            <span className="text-xs text-default-500">District</span>
                            <span className="text-xs font-semibold">{(selectedCompany as any).district?.name || "N/A"}</span>
                          </div>
                          <div className="flex justify-between border-b border-divider pb-2">
                            <span className="text-xs text-default-500">Company Type</span>
                            <span className="text-xs font-semibold">{(selectedCompany as any).companyType?.name || "N/A"}</span>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}

                  {detailTab === "associates" && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-400">
                      {(associatesData?.data?.data?.data || []).length > 0 ? (
                        (associatesData.data.data.data as any[]).map((associate) => {
                          const isSupervisor = (selectedCompany as any).supervisor === associate._id || (selectedCompany as any).supervisor?._id === associate._id;
                          const presence = resolvePresence(associate);
                          return (
                            <Card key={associate._id} className="p-4 border-none bg-default-50 shadow-none flex flex-row items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar
                                  size="sm"
                                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(associate.name)}&background=random&color=fff&bold=true`}
                                />
                                <div>
                                  <div className="text-sm font-bold flex items-center gap-2">
                                    {associate.name}
                                    {isSupervisor && (
                                      <Chip size="sm" color="success" variant="flat" className="h-5 text-[9px] font-black uppercase">Supervisor</Chip>
                                    )}
                                    <Chip
                                      size="sm"
                                      variant="flat"
                                      color={presence.online ? "success" : "default"}
                                      className="h-5 text-[9px] font-bold uppercase"
                                    >
                                      {presence.online ? "Online" : "Offline"}
                                    </Chip>
                                  </div>
                                  <div className="text-[10px] text-default-400">
                                    {associate.email} • {associate.phone} • Last seen {presence.lastSeenLabel}
                                  </div>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant={isSupervisor ? "flat" : "ghost"}
                                color={isSupervisor ? "success" : "warning"}
                                disabled={isSupervisor}
                                isLoading={setSupervisorMutation.isPending && setSupervisorMutation.variables === associate._id}
                                onClick={() => setSupervisorMutation.mutate(associate._id)}
                              >
                                {isSupervisor ? "Main Supervisor" : "Set as Supervisor"}
                              </Button>
                            </Card>
                          );
                        })
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50">
                          <p className="text-xs italic">No associates found for this company.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {detailTab === "web" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                      {!isEditingWeb ? (
                        <div className="flex flex-col gap-6">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-foreground">Website Content Summary</h3>
                            <div className="flex gap-2">
                              {selectedCompany?.website && (
                                <Button
                                  size="sm"
                                  color="primary"
                                  variant="flat"
                                  onClick={() => window.open(selectedCompany.website?.startsWith('http') ? selectedCompany.website : `https://${selectedCompany.website}`, '_blank')}
                                  startContent={<LuExternalLink className="w-4 h-4" />}
                                >
                                  Visit Website
                                </Button>
                              )}
                              <Button
                                size="sm"
                                color="warning"
                                variant="flat"
                                onClick={startEditingWeb}
                                startContent={<LuLayoutDashboard className="w-4 h-4" />}
                              >
                                Edit Content
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="md:col-span-1 p-4 border-none bg-default-50 shadow-none flex flex-col items-center justify-center gap-4">
                              <div className="text-[10px] font-bold text-default-400 uppercase w-full">Logo & Banner</div>
                              <Avatar
                                size="xl"
                                src={selectedCompany?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCompany?.name || "")}&background=random&color=fff&bold=true`}
                                className="w-24 h-24 border-4 border-white dark:border-default-200"
                              />
                              <div className="w-full h-32 rounded-lg bg-default-200 overflow-hidden relative">
                                {selectedCompany?.banner ? (
                                  <img src={selectedCompany.banner} alt="Banner" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-default-400 text-xs italic">No banner set</div>
                                )}
                              </div>
                            </Card>

                            <Card className="md:col-span-2 p-4 border-none bg-default-50 shadow-none space-y-4">
                              <div>
                                <div className="text-[10px] font-bold text-default-400 uppercase mb-1">Tagline</div>
                                <p className="text-sm font-semibold">{selectedCompany?.description || "No tagline set"}</p>
                              </div>
                              <div>
                                <div className="text-[10px] font-bold text-default-400 uppercase mb-1">About Us</div>
                                <p className="text-xs text-default-600 leading-relaxed line-clamp-4">{selectedCompany?.aboutUs || "No company bio provided."}</p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {selectedCompany?.tags?.map((tag: string) => (
                                  <Chip key={tag} size="sm" variant="flat" color="warning" className="text-[9px] font-bold uppercase">{tag}</Chip>
                                )) || <span className="text-[10px] italic text-default-400">No tags added</span>}
                              </div>
                            </Card>
                          </div>

                          <Card className="p-4 border-none bg-default-50 shadow-none space-y-4">
                            <div className="text-[10px] font-bold text-default-400 uppercase">Online Presence</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="flex items-center gap-2">
                                <LuGlobe className="text-warning-500 w-4 h-4" />
                                <a
                                  href={selectedCompany?.website?.startsWith('http') ? selectedCompany.website : `https://${selectedCompany.website}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs truncate text-primary-500 hover:underline font-medium"
                                >
                                  {selectedCompany?.website || "No website link"}
                                </a>
                              </div>
                              <div className="flex items-center gap-2">
                                <LuLinkedin className="text-default-400 w-4 h-4" />
                                <span className="text-xs truncate">{selectedCompany?.socialLinks?.linkedin || "No LinkedIn"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <LuFacebook className="text-default-400 w-4 h-4" />
                                <span className="text-xs truncate">{selectedCompany?.socialLinks?.facebook || "No Facebook"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <LuTwitter className="text-default-400 w-4 h-4" />
                                <span className="text-xs truncate">{selectedCompany?.socialLinks?.twitter || "No Twitter"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <LuInstagram className="text-default-400 w-4 h-4" />
                                <span className="text-xs truncate">{selectedCompany?.socialLinks?.instagram || "No Instagram"}</span>
                              </div>
                            </div>
                          </Card>

                          <Card className="p-4 border-none bg-default-50 shadow-none space-y-4">
                            <div className="flex justify-between items-center">
                              <div className="text-[10px] font-bold text-default-400 uppercase">Domain & Publishing</div>
                              <Chip size="sm" color={selectedCompany?.isWebsiteLive ? "success" : "default"} variant="flat" className="h-5 text-[9px] font-black uppercase">
                                {selectedCompany?.isWebsiteLive ? "Live" : "Draft"}
                              </Chip>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-1">
                                <div className="text-xs font-semibold text-foreground/80">Default Link</div>
                                <div className="text-[11px] text-primary-500 font-mono bg-primary-50/50 p-2 rounded border border-primary-100/50">
                                  {selectedCompany?.subdomain ? `${selectedCompany.subdomain}.company.obaol.com` : "None set"}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs font-semibold text-foreground/80">Custom Domain</div>
                                <div className="text-[11px] text-default-600 font-mono bg-default-100 p-2 rounded border border-divider">
                                  {selectedCompany?.customDomain || "No custom domain linked"}
                                </div>
                              </div>
                            </div>
                          </Card>

                          <Card className="p-4 border-none bg-default-50 shadow-none space-y-4">
                            <div className="text-[10px] font-bold text-default-400 uppercase">Portfolio Links</div>
                            <div className="space-y-4 text-xs">
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
                        <div className="space-y-6">
                          <Card className="p-6 border-none bg-default-50 shadow-none space-y-6">
                            <div className="flex justify-between items-center border-b border-divider pb-4">
                              <h3 className="text-lg font-bold">Edit Web Content</h3>
                              <div className="flex gap-2">
                                <Button size="sm" variant="light" onClick={() => setIsEditingWeb(false)}>Cancel</Button>
                                <Button
                                  size="sm"
                                  color="warning"
                                  isLoading={updateCompanyMutation.isPending}
                                  onClick={() => updateCompanyMutation.mutate(webFields)}
                                >
                                  Save Changes
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                              <div className="space-y-6">
                                <Input
                                  label="Logo URL"
                                  placeholder="https://example.com/logo.png"
                                  value={webFields.logo}
                                  onValueChange={(val) => handleWebFieldChange('logo', val)}
                                  size="sm"
                                  labelPlacement="outside"
                                  startContent={<LuImage className="text-default-400" />}
                                  className="max-w-full"
                                />
                                <Input
                                  label="Banner URL"
                                  placeholder="https://example.com/banner.jpg"
                                  value={webFields.banner}
                                  onValueChange={(val) => handleWebFieldChange('banner', val)}
                                  size="sm"
                                  labelPlacement="outside"
                                  startContent={<LuImage className="text-default-400" />}
                                  className="max-w-full"
                                />
                                <Input
                                  label="Company Website"
                                  placeholder="https://company.com"
                                  value={webFields.website}
                                  onValueChange={(val) => handleWebFieldChange('website', val)}
                                  size="sm"
                                  labelPlacement="outside"
                                  startContent={<LuGlobe className="text-default-400" />}
                                  className="max-w-full"
                                />
                                <Input
                                  label="Tagline"
                                  placeholder="Pure quality, directly from source"
                                  value={webFields.description}
                                  onValueChange={(val) => handleWebFieldChange('description', val)}
                                  size="sm"
                                  labelPlacement="outside"
                                  startContent={<LuBriefcase className="text-default-400" />}
                                  className="max-w-full"
                                />
                                <Input
                                  label="Tags (comma separated)"
                                  placeholder="Exporter, Farmer, Organic"
                                  value={webFields.tags?.join(', ')}
                                  onValueChange={(val) => handleWebFieldChange('tags', val.split(',').map(t => t.trim()).filter(t => t))}
                                  size="sm"
                                  labelPlacement="outside"
                                  startContent={<LuTags className="text-default-400" />}
                                  className="max-w-full"
                                />
                              </div>

                              <div className="space-y-6">
                                <Textarea
                                  label="About Us"
                                  placeholder="Describe the company's legacy and mission..."
                                  value={webFields.aboutUs}
                                  onValueChange={(val) => handleWebFieldChange('aboutUs', val)}
                                  size="sm"
                                  labelPlacement="outside"
                                  minRows={6}
                                  className="max-w-full"
                                />
                                <div className="text-[10px] font-bold text-default-400 uppercase mb-2">Social Media Profiles</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <Input
                                    label="LinkedIn"
                                    placeholder="Username"
                                    value={webFields.socialLinks?.linkedin}
                                    onValueChange={(val) => handleWebFieldChange('socialLinks.linkedin', val)}
                                    size="sm"
                                    labelPlacement="outside"
                                    startContent={<LuLinkedin className="text-default-400" />}
                                  />
                                  <Input
                                    label="Facebook"
                                    placeholder="Username"
                                    value={webFields.socialLinks?.facebook}
                                    onValueChange={(val) => handleWebFieldChange('socialLinks.facebook', val)}
                                    size="sm"
                                    labelPlacement="outside"
                                    startContent={<LuFacebook className="text-default-400" />}
                                  />
                                  <Input
                                    label="Twitter"
                                    placeholder="Username"
                                    value={webFields.socialLinks?.twitter}
                                    onValueChange={(val) => handleWebFieldChange('socialLinks.twitter', val)}
                                    size="sm"
                                    labelPlacement="outside"
                                    startContent={<LuTwitter className="text-default-400" />}
                                  />
                                  <Input
                                    label="Instagram"
                                    placeholder="Username"
                                    value={webFields.socialLinks?.instagram}
                                    onValueChange={(val) => handleWebFieldChange('socialLinks.instagram', val)}
                                    size="sm"
                                    labelPlacement="outside"
                                    startContent={<LuInstagram className="text-default-400" />}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="border-t border-divider pt-6 space-y-6">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h4 className="text-sm font-bold">Domain & Publishing Settings</h4>
                                  <p className="text-[10px] text-default-400">Configure how users access this company website.</p>
                                </div>
                                <Switch
                                  size="sm"
                                  color="success"
                                  isSelected={webFields.isWebsiteLive}
                                  onValueChange={(val) => handleWebFieldChange('isWebsiteLive', val)}
                                >
                                  <span className="text-xs font-bold uppercase">{webFields.isWebsiteLive ? 'Live' : 'Hidden'}</span>
                                </Switch>
                              </div>

                              <div className="p-4 bg-primary-50/30 border border-primary-100 rounded-2xl space-y-3">
                                <div className="flex items-center gap-2 text-primary-600">
                                  <LuInfo className="w-4 h-4" />
                                  <span className="text-xs font-bold uppercase tracking-wider">How to link your website</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <div className="text-[11px] font-bold text-foreground">1. Default Subdomain</div>
                                    <p className="text-[10px] text-default-500 leading-relaxed">Choose a unique name to host your site on our platform instantly (e.g., <span className="text-primary-600 font-mono">mahindra.company.obaol.com</span>).</p>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="text-[11px] font-bold text-foreground">2. Custom Domain (Advanced)</div>
                                    <p className="text-[10px] text-default-500 leading-relaxed">To use your own domain (e.g., <span className="text-primary-600 font-mono">www.yourbrand.com</span>), point your DNS <strong>CNAME</strong> record to <span className="text-primary-600 font-mono bg-white px-1 border rounded">brand.obaol.com</span></p>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <Input
                                    label="OBAOL Subdomain"
                                    placeholder="brandname"
                                    value={webFields.subdomain}
                                    onValueChange={(val) => handleWebFieldChange('subdomain', val.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                    size="sm"
                                    labelPlacement="outside"
                                    startContent={<span className="text-default-400 text-xs font-mono">https://</span>}
                                    endContent={<span className="text-default-400 text-[10px] font-mono whitespace-nowrap">.company.obaol.com</span>}
                                    description={webFields.subdomain ? "Your brand experience will be live at this link." : "Enter a unique handle for your brand."}
                                  />
                                </div>
                                <div className="space-y-4">
                                  <Input
                                    label="Custom Branding Domain"
                                    placeholder="www.yourbrand.com"
                                    value={webFields.customDomain}
                                    onValueChange={(val) => handleWebFieldChange('customDomain', val.toLowerCase())}
                                    size="sm"
                                    labelPlacement="outside"
                                    startContent={<LuGlobe className="text-default-400 w-4 h-4" />}
                                    description="Requires DNS CNAME record pointing to brand.obaol.com"
                                  />
                                </div>
                              </div>
                            </div>
                          </Card>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-10">
                <div className="w-24 h-24 bg-warning-50 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-warning-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-foreground/90 uppercase tracking-tight">Select a Company</h3>
                <p className="text-default-500 max-w-[320px] mt-2 text-sm leading-relaxed">
                  {activeTab === "live"
                    ? "Choose a live company to manage their current in-market rates."
                    : activeTab === "active"
                      ? "Pick an active company to review or take their products live."
                      : "Select an empty company to begin their first product allocation."}
                </p>
              </div>
            )}
          </Card>
        </div>

      </div>
      <div className="h-6" />
    </div>
  );
}
