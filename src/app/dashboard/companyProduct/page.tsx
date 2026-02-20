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
} from "@heroui/react";

const Tabs = HeroTabs as any;
const Tab = HeroTab as any;
const Chip = HeroChip as any;
const Select = HeroSelect as any;
import VariantRate from "@/components/dashboard/Catalog/variant-rate";
import AuthContext from "@/context/AuthContext";
import { getData, patchData } from "@/core/api/apiHandler";
import {
  associateCompanyRoutes,
  variantRateRoutes,
  employeeRoutes,
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
}

export default function CompanyProductPage() {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("live"); // "live", "active", "empty"
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const { data: companyData, isLoading: loadingCompanies } = useQuery({
    queryKey: ["companies"],
    queryFn: () => getData(associateCompanyRoutes.getAll, { limit: 10000 }),
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
                  "group-data-[selected=true]:text-warning-500 font-semibold text-xs",
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
        <div className="flex-1 min-w-0 overflow-x-auto">
          <Card className="h-full bg-background/60 backdrop-blur-md border-none shadow-sm overflow-hidden flex flex-col min-w-0 max-w-full">
            {selectedCompany ? (
              <>
                <div className="p-6 border-b border-default-100 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar
                      size="lg"
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCompany.name)}&background=random&color=fff&bold=true`}
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
                  {activeTab !== "empty" ? (
                    <VariantRate
                      rate="variantRate"
                      additionalParams={{
                        associateCompany: selectedCompany._id,
                        ...(activeTab === "live" ? { isLive: true } : {})
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
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
