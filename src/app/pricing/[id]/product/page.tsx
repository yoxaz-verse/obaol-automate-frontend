"use client";
import { NextPage } from "next";
import { useContext, useState } from "react";

import { usePathname } from "next/navigation";
import React from "react";
import { generateColumns, initialTableConfig } from "@/utils/tableValues";
import AuthContext from "@/context/AuthContext";
import VariantRate from "@/components/dashboard/Catalog/variant-rate";
const Projects: NextPage = () => {
  const [projectdetails, setProjectDetails] = useState(true);
  const [project, setProject] = useState({ id: "123" });
  function viewProjectDetails(data: any) {
    setProjectDetails(true);
    setProject(data);
  }
  const [role] = useState<any>();
  const pathname = usePathname().split("/").pop()?.toString() || ""; // Gets the current URL pathname
  const tableConfig = { ...initialTableConfig }; // Create a copy to avoid mutations

  const { user } = useContext(AuthContext);
  const columns = generateColumns("displayedRate", tableConfig);

  return (
    <div className="flex items-center justify-center ">
      <div className="w-[95%]  ">Yooooooooo</div>
    </div>
  );
};

export default Projects;
