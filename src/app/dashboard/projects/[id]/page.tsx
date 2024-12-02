"use client";
import { useQuery } from "@tanstack/react-query";
import { NextPage } from "next";
import React, { useEffect, useState } from "react";

import ProjectDetails from "@/components/dashboard/Projects/project-details";
import { Tab, Tabs, useDisclosure } from "@nextui-org/react";
import CommonDeleteModal from "@/components/Modals/Common-delete-modal";
import EditProject from "@/components/Modals/edit-project";
import { getData } from "@/core/api/apiHandler";
import { locationRoutes, projectRoutes } from "@/core/api/apiRoutes";
import { usePathname } from "next/navigation";

const Projects: NextPage = () => {
  const [projectdetails, setProjectDetails] = useState(true);
  const [project, setProject] = useState({ id: "123" });
  function viewProjectDetails(data: any) {
    setProjectDetails(true);
    setProject(data);
  }
  const [role, setRole] = useState<any>();
  const pathname = usePathname().split("/").pop()?.toString() || ""; // Gets the current URL pathname

  return (
    <div className="flex items-center justify-center">
      {/* <div className="w-full p-[1rem]">
        <ManagerActivityDetailsComponent />
      </div> */}
      <div className="w-[95%] ">
        <ProjectDetails
          id={pathname}
          role={role}
          setProjectDetail={(value) => setProjectDetails(value)}
        />
      </div>
    </div>
  );
};

export default Projects;
