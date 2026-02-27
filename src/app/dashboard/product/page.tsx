// pages/Catalog.tsx
"use client";

import React, { useContext, useState } from "react";
import { Spacer } from "@heroui/react";
import VariantRate from "@/components/dashboard/Catalog/variant-rate";
import { Tab, Tabs } from "@nextui-org/tabs";
import AuthContext from "@/context/AuthContext";

export default function Product() {
  const [currentTable, setCurrentTable] = useState("mine"); // Default to My Products

  const { user } = useContext(AuthContext);

  return (
    <div className="flex items-center justify-center ">
      <div className="w-[95%]  ">
        <div className=" ">
          <div className="flex w-[100%] gap-4 h-[80vh]">
            <div className="w-[100%] min-w-0 pb-10">
              {/* Tabs for selecting between different roles */}
              {/* @ts-ignore */}
              <Tabs
                aria-label="Selected" // Translate
                selectedKey={currentTable}
                onSelectionChange={(key) => setCurrentTable(key as string)}
              >
                {user?.role === "Associate" ? (
                  <>
                    <Tab key={"mine"} title="My Products">
                      <VariantRate
                        rate="variantRate"
                        additionalParams={{ associate: user?.id }}
                      />
                    </Tab>
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
              </Tabs>{" "}
            </div>
          </div>
          {/* @ts-ignore */}
          <Spacer y={4} />
        </div>
      </div>
    </div>
  );
}
