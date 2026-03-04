// pages/Catalog.tsx
"use client";

import React, { useContext, useEffect, useState } from "react";
import { Spacer } from "@heroui/react";
import VariantRate from "@/components/dashboard/Catalog/variant-rate";
import { Tab, Tabs } from "@nextui-org/tabs";
import AuthContext from "@/context/AuthContext";

export default function Product() {
  const [currentTable, setCurrentTable] = useState("mine"); // Default to My Products

  const { user } = useContext(AuthContext);
  const isAssociate = user?.role === "Associate";
  const hasLinkedCompany = Boolean((user as any)?.associateCompanyId);
  const isNoCompanyAssociate = isAssociate && !hasLinkedCompany;

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
          <div className="mb-4">
            {/* Tabs for selecting between different roles */}
            {/* @ts-ignore */}
            <Tabs
              aria-label="Selected" // Translate
              selectedKey={currentTable}
              onSelectionChange={(key) => setCurrentTable(key as string)}
              variant="underlined"
              className="w-full"
              classNames={{
                tabList: "gap-8 w-full relative rounded-none p-0 border-b border-divider flex-nowrap overflow-x-auto no-scrollbar",
                cursor: "w-full bg-primary h-[3px]",
                tab: "max-w-fit px-0 h-10 flex-shrink-0",
                tabContent: "group-data-[selected=true]:text-primary font-black uppercase tracking-widest text-[11px]"
              }}
            >
              {isAssociate ? (
                <>
                  {!isNoCompanyAssociate && (
                    <Tab key={"mine"} title="My Products">
                      <VariantRate
                        rate="variantRate"
                        additionalParams={{ associate: user?.id }}
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
                      additionalParams={{ selected: true }}
                    />
                  </Tab>
                  <Tab key={"live"} title="Live Products">
                    <VariantRate
                      rate="variantRate"
                      additionalParams={{ isLive: true }}
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
