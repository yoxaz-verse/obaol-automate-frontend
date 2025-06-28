"use client";

import { useQuery } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import { variantRateRoutes } from "@/core/api/apiRoutes";
import LiveMapWrapper from "@/components/LiveMap/LiveMapWrapper";
import { initialTableConfig } from "@/utils/tableValues";
import { useState } from "react";
import DynamicFilter from "@/components/CurdTable/dynamic-filtering";
import { Spacer } from "@nextui-org/react";

export default function Page() {
  const [filters, setFilters] = useState<Record<string, any>>({}); // Dynamic filters
  const { data: variantRateResponse } = useQuery({
    queryKey: ["variantRate", filters],
    queryFn: () =>
      getData(variantRateRoutes.getAll, { limit: 10000, ...filters }),
  });

  const variantRateValue = variantRateResponse?.data?.data?.data;
  const tableConfig = { ...initialTableConfig }; // avoid mutations
  // Step 1: Combine all fields
  const combinedFields = [
    ...(tableConfig["category"] || []),
    ...(tableConfig["subCategory"] || []),
    ...(tableConfig["product"] || []),
    ...(tableConfig["productVariant"] || []),
    ...(tableConfig["variantRate"] || []),
  ];

  // Step 2: Create a map to track the preferred field (prefer "select" over "text")
  const fieldMap = new Map<string, any>();

  combinedFields.forEach((field) => {
    const existing = fieldMap.get(field.key);

    if (!existing) {
      fieldMap.set(field.key, field);
    } else if (existing.type === "text" && field.type === "select") {
      // Replace text with select if exists
      fieldMap.set(field.key, field);
    }
    // If existing is select, we ignore the text one
  });

  // Step 3: Final filtered field list
  const variantRateFormFields = Array.from(fieldMap.values());
  const handleFiltersUpdate = (updatedFilters: Record<string, any>) => {
    setFilters(updatedFilters); // Update the filters
  };
  console.log(filters);

  return (
    <div className=" w-full h-[75vh] overflow-hidden   gap-2">
      <div className="absolute bottom-2 right-2">
        <DynamicFilter
          currentTable={"variantRate"}
          formFields={variantRateFormFields}
          onApply={handleFiltersUpdate} // Pass the callback to DynamicFilter
        />
      </div>
      <Spacer y={2} />
      <div className="h-[82vh]  w-full">
        <LiveMapWrapper mappingValue={variantRateValue} />
      </div>
    </div>
  );
}
