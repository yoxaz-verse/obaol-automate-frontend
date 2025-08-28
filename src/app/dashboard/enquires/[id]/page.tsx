"use client";
import { NextPage } from "next";
import React, { useState } from "react";

import { usePathname } from "next/navigation";

const Projects: NextPage = () => {
  const [projectdetails, setProjectDetails] = useState(true);
  const [project, setProject] = useState({ id: "123" });
  function viewProjectDetails(data: any) {
    setProjectDetails(true);
    setProject(data);
  }
  const [role] = useState<any>();
  const pathname = usePathname().split("/").pop()?.toString() || ""; // Gets the current URL pathname

  return (
    <div className="flex items-center justify-center">
      {/* <div className="w-full p-[1rem]">
        <ManagerActivityDetailsComponent />
      </div> */}
      <div className="w-[95%] "></div>
    </div>
  );
};

export default Projects;
