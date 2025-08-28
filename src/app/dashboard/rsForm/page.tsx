// pages/Catalog.tsx
"use client";

import React, { useContext, useState } from "react";
import AuthContext from "@/context/AuthContext";

import { apiRoutesByRole, initialTableConfig } from "@/utils/tableValues";
import AddForm from "@/components/CurdTable/add-form";

export default function Product() {
  const { user } = useContext(AuthContext);

  const role = user?.role.toLowerCase();
  const tableConfig = { ...initialTableConfig }; // Create a copy to avoid mutations
  let formFields = tableConfig["researchedCompany"];

  return (
    role && (
      <div className="flex  m-10 ">
        <div className="w-full max-w-[500px]">
          <AddForm
            name={"Form fill"}
            currentTable={"researchedCompany"}
            formFields={formFields}
            apiEndpoint={apiRoutesByRole["researchedCompany"]}
          />
        </div>{" "}
      </div>
    )
  );
}
