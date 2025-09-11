"use client";

import React, { useContext } from "react";
import AuthContext from "@/context/AuthContext";
import { apiRoutesByRole, initialTableConfig } from "@/utils/tableValues";
import AddForm from "@/components/CurdTable/add-form";
import CompanySearch from "@/components/dashboard/Company/CompanySearch";

export default function RSForm() {
  const { user } = useContext(AuthContext);
  const role = user?.role.toLowerCase();
  const tableConfig = { ...initialTableConfig };
  let formFields = tableConfig["researchedCompany"];

  return (
    role && (
      <div className="flex flex-col my-10 px-4 w-full">
        {/* 🔍 Company Search */}
        <CompanySearch
          onSelect={(id) => console.log("Selected company:", id)}
        />

        {/* 📝 Form */}
        <AddForm
          grid="3"
          name={"Research Form"}
          currentTable={"researchedCompany"}
          formFields={formFields}
          apiEndpoint={apiRoutesByRole["researchedCompany"]}
        />
      </div>
    )
  );
}
