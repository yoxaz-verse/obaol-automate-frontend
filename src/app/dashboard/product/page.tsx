// pages/Catalog.tsx
"use client";

import React, { useContext, useEffect, useState } from "react";
import { Spacer } from "@heroui/react";
import VariantRate from "@/components/dashboard/Catalog/variant-rate";
import { Tab, Tabs } from "@nextui-org/tabs";
import AuthContext from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import { associateCompanyRoutes } from "@/core/api/apiRoutes";
import CompanySearch from "@/components/dashboard/Company/CompanySearch";

export default function Product() {
  const [currentTable, setCurrentTable] = useState("mine"); // Default to My Products

  const { user } = useContext(AuthContext);
  const roleLower = String(user?.role || "").toLowerCase();
  const isOperatorUser = roleLower === "operator" || roleLower === "team";
  const isAssociate = user?.role === "Associate";
  const hasLinkedCompany = Boolean((user as any)?.associateCompanyId);
  const isNoCompanyAssociate = isAssociate && !hasLinkedCompany;
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const inventoryStatusEnabled = isAssociate ? true : Boolean(selectedCompanyId);

  const { data: companyData } = useQuery({
    queryKey: ["product-page-assigned-companies", associateCompanyRoutes.getAll, user?.id, roleLower],
    queryFn: () => getData(associateCompanyRoutes.getAll, { limit: 300 }),
    enabled: isOperatorUser,
  });

  const operatorScopedCompanyIds: string[] = isOperatorUser
    ? ((companyData?.data?.data?.data || []) as Array<{ _id?: string }>)
        .map((company) => company?._id)
        .filter((id): id is string => Boolean(id))
    : [];

  useEffect(() => {
    if (isOperatorUser && !selectedCompanyId && operatorScopedCompanyIds.length === 1) {
      setSelectedCompanyId(operatorScopedCompanyIds[0]);
    }
  }, [isOperatorUser, operatorScopedCompanyIds, selectedCompanyId]);

  const operatorProductParams = isOperatorUser
    ? { associateCompany: selectedCompanyId ? [selectedCompanyId] : operatorScopedCompanyIds }
    : { selected: true };

  const operatorLiveProductParams = isOperatorUser
    ? { associateCompany: selectedCompanyId ? [selectedCompanyId] : operatorScopedCompanyIds, isLive: true }
    : { isLive: true };

  useEffect(() => {
    if (isNoCompanyAssociate && currentTable !== "catalog") {
      setCurrentTable("catalog");
    }
  }, [isNoCompanyAssociate, currentTable]);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full px-4 md:px-0 md:w-[95%]">
        <div className="min-h-[70vh] pb-10">
          {isNoCompanyAssociate && (
            <div className="mb-4 rounded-xl border border-warning-300/30 bg-warning-500/10 px-4 py-3">
              <p className="text-xs font-semibold text-warning-700 dark:text-warning-300">
                Marketplace-to-Catalog mode active. Link company to publish own rates.
              </p>
            </div>
          )}
          {(roleLower === "admin" || isOperatorUser) && (
            <div className="mb-4">
              <CompanySearch
                defaultSelected={selectedCompanyId}
                onSelect={(id) => setSelectedCompanyId(id)}
                itemsFilter={
                  isOperatorUser
                    ? (companies) => companies.filter((c) => operatorScopedCompanyIds.includes(c._id))
                    : undefined
                }
              />
            </div>
          )}
          <div className="mb-4">
            {/* Tabs for selecting between different roles */}
            {/* @ts-ignore */}
            <Tabs
              aria-label="Selected" // Translate
              selectedKey={currentTable}
              onSelectionChange={(key) => setCurrentTable(key as string)}
              variant="underlined"
              className="w-full"
              color="warning"
              classNames={{
                tabList: "gap-10 relative rounded-none p-0 border-b border-divider/40 flex-nowrap overflow-x-auto no-scrollbar bg-transparent",
                cursor: "bg-warning-500 w-full h-[3px] rounded-t-full shadow-[0_-1px_10px_rgba(245,158,11,0.4)]",
                tab: "max-w-fit px-2 h-14 transition-all duration-300",
                tabContent: "font-black uppercase tracking-widest text-[11px] text-default-400 group-data-[selected=true]:text-warning-500 group-data-[selected=true]:scale-110 transition-transform"
              }}
            >
              {isAssociate ? (
                <>
                  {!isNoCompanyAssociate && (
                    <Tab key={"mine"} title="My Products">
                      <VariantRate
                        rate="variantRate"
                        additionalParams={{ associate: user?.id }}
                        showInventoryStatus={inventoryStatusEnabled}
                        inventoryCompanyId={(user as any)?.associateCompanyId || null}
                      />
                    </Tab>
                  )}
                  <Tab key={"catalog"} title="Added to Catalog">
                    <VariantRate
                      rate="catalogItem"
                      additionalParams={{ associateId: user?.id }}
                    />
                  </Tab>
                </>
              ) : (
                <>
                  <Tab key={"selected"} title="Products">
                    <VariantRate
                      rate="variantRate"
                      additionalParams={operatorProductParams}
                      showAssociateColumn={isOperatorUser}
                      showInventoryStatus={inventoryStatusEnabled}
                      inventoryCompanyId={selectedCompanyId}
                    />
                  </Tab>
                  <Tab key={"live"} title="Live Products">
                    <VariantRate
                      rate="variantRate"
                      additionalParams={operatorLiveProductParams}
                      showAssociateColumn={isOperatorUser}
                      showInventoryStatus={inventoryStatusEnabled}
                      inventoryCompanyId={selectedCompanyId}
                    />
                  </Tab>
                </>
              )}
            </Tabs>
          </div>
          {/* @ts-ignore */}
          <Spacer y={4} />
        </div>
      </div>
    </div>
  );
}
