// pages/Catalog.tsx
"use client";

import React, { useContext, useState } from "react";
import { Button, Spacer } from "@heroui/react";
import { initialTableConfig } from "@/utils/tableValues";
import { useQuery } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import { subCategoryRoutes } from "@/core/api/apiRoutes";
import VariantRate from "@/components/dashboard/Catalog/variant-rate";
import { Tab, Tabs } from "@nextui-org/tabs";
import AuthContext from "@/context/AuthContext";

export default function Product() {
  const tableConfig = { ...initialTableConfig }; // Create a copy to avoid mutations
  const refetchData = () => {
    // Implement refetch logic if necessary
  };
  const [currentTable, setCurrentTable] = useState("selected"); // Default role set to 'manager'

  const tables = [
    { key: "selected", title: "Selected Products Variants" }, // Translate Title
    { key: "mine", title: "My Products" }, // Translate Title
    { key: "selectMore", title: "Add More" }, // Translate Title
    // { key: "worker", title: "Staff" },// Translate Title
  ];
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
                <Tab key={"selected"} title={"Selected Products Variants"}>
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
                <Tab key={"selectMore"} title={"Add More"}>
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
