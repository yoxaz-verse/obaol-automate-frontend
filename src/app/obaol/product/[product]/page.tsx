"use client";
import { NextPage } from "next";
import { useContext, useState } from "react";
import { usePathname } from "next/navigation";
import React from "react";
import {
  apiRoutesByRole,
  generateColumns,
  initialTableConfig,
} from "@/utils/tableValues";
import AuthContext from "@/context/AuthContext";
import VariantRate from "@/components/dashboard/Catalog/variant-rate";
import { Spacer } from "@nextui-org/react";
import Title from "@/components/titles";


const Projects: NextPage = () => {
  const [projectdetails, setProjectDetails] = useState(true);
  const [project, setProject] = useState({ id: "123" });
  function viewProjectDetails(data: any) {
    setProjectDetails(true);
    setProject(data);
  }
  const [role] = useState<any>();
  const pathname = usePathname();
  const product = pathname.split("/").pop()?.toString() || ""; // Gets the current URL pathname
  const tableConfig = { ...initialTableConfig }; // Create a copy to avoid mutations
  const match = pathname.match(/\/pricing\/(.*?)\/product\//);
  const CompanyName = match?.[1] || "";
  const { user } = useContext(AuthContext);
  const columns = generateColumns("displayedRate", tableConfig);

  return (
    <div className="flex items-center justify-center ">
      <div className="w-[95%]  ">
        <Spacer y={6} />
        <div className="text-white">
          <Title title={product.replace(/\b\w/g, (c) => c.toUpperCase())} />
        </div>
        <VariantRate
          displayOnly={true}
          rate="displayedRate"
          VariantRateMixed
          additionalParams={{
            associateCompanyName: CompanyName,
            product: product,
          }}
        />
      </div>
    </div>
  );
};

export default Projects;
