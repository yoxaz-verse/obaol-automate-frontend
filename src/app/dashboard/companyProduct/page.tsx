"use client";

import React, { useMemo, useState, useContext } from "react";
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
import { LuGlobe, LuMail, LuPhone, LuMapPin, LuLinkedin, LuFacebook, LuTwitter, LuInstagram, LuImage, LuBriefcase, LuTags, LuLayoutDashboard, LuExternalLink, LuInfo } from "react-icons/lu";
import VariantRate from "@/components/dashboard/Catalog/variant-rate";
import AuthContext from "@/context/AuthContext";
import { getData, patchData } from "@/core/api/apiHandler";
import {
  associateCompanyRoutes,
  variantRateRoutes,
  employeeRoutes,
  associateRoutes,
} from "@/core/api/apiRoutes";
import CompanySearch from "@/components/dashboard/Company/CompanySearch";

interface Company {
  _id: string;
  name: string;
  assignedEmployee?: any;
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
  const queryClient = useQueryClient();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("live"); // "live", "active", "empty"
  const [detailTab, setDetailTab] = useState<string>("products"); // "products", "details", "associates", "web"
  const [isAssigning, setIsAssigning] = useState(false);
  const [isEditingWeb, setIsEditingWeb] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [webFields, setWebFields] = useState<any>({});

  const { data: companyData, isLoading: loadingCompanies } = useQuery({
    queryKey: ["companies"],
    queryFn: () => getData(associateCompanyRoutes.getAll, { limit: 10000 }),
  });

  const { data: associatesData, refetch: refetchAssociates } = useQuery({
    queryKey: ["associates", selectedCompanyId],
    queryFn: () => getData(associateRoutes.getAll, { associateCompany: selectedCompanyId, limit: 1000 }),
    enabled: !!selectedCompanyId && detailTab === "associates",
  });

  const { data: employeeData, isLoading: loadingEmployees } = useQuery({
    queryKey: ["employees"],
    queryFn: () => getData(employeeRoutes.getAll, { limit: 10000 }),
    enabled: user?.role === "admin",
  });

  const assignMutation = useMutation({
    mutationFn: (employeeId: string | null) =>
      patchData(`${associateCompanyRoutes.getAll}/${selectedCompanyId}`, { assignedEmployee: employeeId }),
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
    liveCompanies,
    activeCompanies,
    emptyCompanies,
    selectedCompany,
    allEmployees,
  } = useMemo(() => {
    let allCompanies: Company[] = companyData?.data?.data?.data || [];
    const allEmployees: any[] = employeeData?.data?.data?.data || [];

    // Role-based filtering: Employees only see assigned companies
    // Note: Backend hook also handles this, but frontend filtering is a nice double-layer for UX
    if (user?.role === "employee") {
      allCompanies = allCompanies.filter(c => {
        const assignedId = typeof c.assignedEmployee === "object" ? c.assignedEmployee?._id : c.assignedEmployee;
        return assignedId === user?.id;
      });
    }

    // Categorize using backend-provided stats
    const live = allCompanies
      .filter((c) => (c.stats?.liveProducts || 0) > 0)
      .map(c => ({ ...c, productCount: c.stats?.liveProducts }));

    const active = allCompanies
      .filter((c) => (c.stats?.totalProducts || 0) > 0 && (c.stats?.liveProducts || 0) === 0)
      .map(c => ({ ...c, productCount: c.stats?.totalProducts }));

    const empty = allCompanies.filter((c) => (c.stats?.totalProducts || 0) === 0);

    // Determine selection based on current tab
    const currentList =
      activeTab === "live" ? live :
        activeTab === "active" ? active :
          empty;

    const selected = currentList.find(c => c._id === selectedCompanyId) || null;

    return {
      liveCompanies: live,
      activeCompanies: active,
      emptyCompanies: empty,
      selectedCompany: selected,
      allEmployees,
    };
  }, [companyData, employeeData, selectedCompanyId, activeTab, user]);

  if (loadingCompanies) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-warning-500 animate-pulse font-medium">Loading company catalog...</div>
      </div>
    );
  }

  const displayedCompanies =
    activeTab === "live" ? liveCompanies :
      activeTab === "active" ? activeCompanies :
        emptyCompanies;

  const handleAssign = () => {
    assignMutation.mutate(selectedEmployeeId);
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-180px)] min-h-[600px]">

        {/* --- Sidebar (Master) --- */}
        <div className="w-full md:w-[320px] lg:w-[380px] flex flex-col gap-4">
          <Card className="p-4 bg-background/60 backdrop-blur-md border-none shadow-sm h-full overflow-hidden">
            <h2 className="text-lg font-bold text-foreground/90 mb-4 tracking-tight">Catalog Companies</h2>

            <CompanySearch
              defaultSelected={selectedCompanyId}
              itemsFilter={(companies) =>
                companies.filter((c) =>
                  displayedCompanies.some((p) => p._id === c._id)
                )
              }
              onSelect={(id) => setSelectedCompanyId(id)}
            />

            <Tabs
              fullWidth
              size="sm"
              variant="underlined"
              aria-label="Filter companies"
              selectedKey={activeTab}
              onSelectionChange={(key: any) => {
                setActiveTab(key as string);
                setSelectedCompanyId(null);
              }}
              classNames={{
                tabList:
                  "gap-4 w-full relative rounded-none p-0 border-b border-divider overflow-x-auto",
                cursor: "w-full bg-warning-500",
                tab: "max-w-fit px-0 h-10",
                tabContent:
                  "group-data-[selected=true]:text-warning-500 group-data-[selected=true]:font-bold text-xs font-medium text-default-500 dark:text-default-400",
              }}
            >
              <Tab
                key="live"
                title={
                  <div className="flex items-center space-x-1 whitespace-nowrap">
                    <span>Live</span>
                    <div className="bg-success-50 text-success-600 px-1 py-0.5 rounded text-[10px] font-bold">
                      {liveCompanies.length}
                    </div>
                  </div>
                }
              />
              <Tab
                key="active"
                title={
                  <div className="flex items-center space-x-1 whitespace-nowrap">
                    <span>Active</span>
                    <div className="bg-warning-50 text-warning-600 px-1 py-0.5 rounded text-[10px] font-bold">
                      {activeCompanies.length}
                    </div>
                  </div>
                }
              />
              <Tab
                key="empty"
                title={
                  <div className="flex items-center space-x-1 whitespace-nowrap">
                    <span>Empty</span>
                    <div className="bg-default-100 text-default-600 px-1 py-0.5 rounded text-[10px] font-bold">
                      {emptyCompanies.length}
                    </div>
                  </div>
                }
              />
            </Tabs>

            <div className="flex-1 overflow-y-auto mt-4 pr-2 custom-scrollbar">
              <div className="flex flex-col gap-2">
                {displayedCompanies.map((company) => {
                  const isActive = selectedCompanyId === company._id;
                  const prodCount = (company as any).productCount;

                  return (
                    <button
                      key={company._id}
                      onClick={() => setSelectedCompanyId(company._id)}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${isActive
                        ? "bg-warning-500 text-white shadow-md scale-[1.02]"
                        : "bg-default-100/50 hover:bg-default-200/50 text-foreground/80 hover:scale-[1.01]"
                        }`}
                    >
                      <Avatar
                        size="sm"
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=random&color=fff&bold=true`}
                        className="flex-shrink-0 border-2 border-white/20"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate text-sm">{company.name}</div>
                        {activeTab !== "empty" && (
                          <div className={`text-[10px] ${isActive ? "text-white/80" : "text-default-400"}`}>
                            {prodCount} {activeTab === "live" ? "live products" : "total products"}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
                {displayedCompanies.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-10 opacity-60">
                    <svg className="w-10 h-10 text-default-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-xs italic">No companies here.</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* --- Main Content (Detail) --- */}
        <div className="flex-1 min-w-0">
          <Card className="h-full bg-background/60 backdrop-blur-md border-none shadow-sm overflow-hidden flex flex-col min-w-0 max-w-full">
            {selectedCompany ? (
              <>
                <div className="p-6 border-b border-default-100 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar
                      size="lg"
                      src={selectedCompany.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCompany.name)}&background=random&color=fff&bold=true`}
                      className="border-4 border-warning-100 shadow-sm"
                    />
                    <div>
                      <h1 className="text-2xl font-black text-foreground tracking-tight">{selectedCompany.name}</h1>
                      <div className="flex items-center gap-2 mt-1">
                        <Chip
                          size="sm"
                          variant="flat"
                          color={activeTab === "live" ? "success" : activeTab === "active" ? "warning" : "default"}
                          className="capitalize text-[10px] font-bold"
                        >
                          {activeTab} Status
                        </Chip>
                        <p className="text-default-400 text-[11px] font-medium">
                          {activeTab === "live" ? "Showing live products only" :
                            activeTab === "active" ? "Showing all offline products" :
                              "Initial allocation required"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* --- Employee Assignment Section (Admin Only) --- */}
                  {user?.role === "admin" && (
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-[10px] font-bold text-default-400 uppercase">Assigned Overseer</div>
                      {!isAssigning ? (
                        <div className="flex items-center gap-2">
                          {selectedCompany.assignedEmployee ? (
                            <div className="flex items-center gap-2 bg-default-100 px-3 py-1.5 rounded-full">
                              <Avatar
                                size="xs"
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(typeof selectedCompany.assignedEmployee === 'object' ? selectedCompany.assignedEmployee.name : 'Unknown')}&background=random`}
                              />
                              <span className="text-xs font-semibold text-foreground/80">
                                {typeof selectedCompany.assignedEmployee === 'object' ? selectedCompany.assignedEmployee.name : 'Unknown'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-default-400 italic">No one assigned</span>
                          )}
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="text-warning-500"
                            onClick={() => {
                              setSelectedEmployeeId(typeof selectedCompany.assignedEmployee === 'object' ? selectedCompany.assignedEmployee._id : null);
                              setIsAssigning(true);
                            }}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Select
                            size="sm"
                            placeholder="Assign Employee"
                            className="w-48"
                            selectedKeys={selectedEmployeeId ? [selectedEmployeeId] : []}
                            onSelectionChange={(keys: any) => setSelectedEmployeeId(Array.from(keys)[0] as string)}
                          >
                            {allEmployees.map((emp) => (
                              <SelectItem key={emp._id} textValue={emp.name}>
                                <div className="flex items-center gap-2">
                                  <Avatar size="xs" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=random`} />
                                  <span>{emp.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </Select>
                          <Button
                            size="sm"
                            color="warning"
                            isLoading={assignMutation.isPending}
                            onClick={handleAssign}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            onClick={() => setIsAssigning(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* --- Assigned Overseer (Employee View) --- */}
                  {user?.role === "employee" && selectedCompany.assignedEmployee && (
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-[10px] font-bold text-default-400 uppercase">Your Assignment</div>
                      <div className="flex items-center gap-2 bg-success-50 px-3 py-1 rounded-full border border-success-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-success-700">Under your supervision</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar min-w-0 max-w-full">
                  <div className="mb-6">
                    <Tabs
                      aria-label="Detail Sections"
                      selectedKey={detailTab}
                      onSelectionChange={(key: any) => setDetailTab(key as string)}
                      variant="solid"
                      color="warning"
                      size="sm"
                      classNames={{
                        tabList: "bg-default-200/50 dark:bg-default-100/50 p-1",
                        cursor: "bg-warning-500 shadow-sm",
                        tab: "h-8",
                        tabContent: "group-data-[selected=true]:text-white font-bold text-xs",
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
                                  </div>
                                  <div className="text-[10px] text-default-400">{associate.email} • {associate.phone}</div>
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
