// pages/Catalog.tsx
"use client";

import React, { useContext, useState } from "react";
import { Spacer } from "@heroui/react";
import VariantRate from "@/components/dashboard/Catalog/variant-rate";
import { Tab, Tabs } from "@nextui-org/tabs";
import AuthContext from "@/context/AuthContext";

export default function Product() {
  const [currentTable, setCurrentTable] = useState("selected"); // Default role set to 'manager'

  const { user } = useContext(AuthContext);

  return (
    <div className="flex items-center justify-center ">
      <div className="w-[95%]  ">
        <div className=" ">
          <div className="flex w-[100%] gap-4 h-[80vh]">
            <div className="w-[100%] pb-10  pr-6 overflow-auto">
              {/* Tabs for selecting between different roles */}
              <Tabs
                aria-label="Selected" // Translate
                selectedKey={currentTable}
                onSelectionChange={(key) => setCurrentTable(key as string)}
              >
                <Tab key={"selected"} title={"Products"}>
                  {/* Render UserTabContent for the current table */}
                  <VariantRate
                    rate={
                      user?.role === "Admin" ? "variantRate" : "displayedRate"
                    }
                    additionalParams={{
                      selected: true,
                    }}
                  />
                </Tab>
                <Tab key={"mine"} title={"My Products"}>
                  {/* Render UserTabContent for the current table */}
                  <VariantRate
                    rate="variantRate"
                    additionalParams={
                      user?.role === "Associate"
                        ? {
                            associate: user?.id,
                          }
                        : {}
                    }
                  />
                </Tab>
                <Tab key={"selectMore"} title={"More"}>
                  {/* Render UserTabContent for the current table */}
                  <VariantRate rate="variantRate" />
                </Tab>
              </Tabs>{" "}
            </div>
          </div>
          <Spacer y={4} />
        </div>
      </div>
    </div>
  );
}
