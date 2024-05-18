"use client";
import React, { useState } from "react";
import CommonTable from "../Table/common-table";
import { columns, tableData } from "@/data/content-data";
import NewProjectsForm from "./new-projects-form";
import NewProjectsCharts from "./new-projects-charts";
import ManagerActivityDetailsComponent from "./manager-activity-details";
import ProjectDetails from "./project-details";

const Projects = ({ role }: { role: string }) => {
  const [projectdetails, setProjectDetails] = useState(false);
  const [project,setProject] = useState({id:'123'});
  function viewProjectDetails(data: any) {
    setProjectDetails(true);
    setProject(data);
  }
  return (
    <div className="flex items-center justify-center">
      {!projectdetails?
      <div className="w-[95%]">
        <div className="py-2 text-lg font-medium">Projects List</div>
        <CommonTable
          TableData={tableData}
          columns={columns}
          viewProjectDetails={viewProjectDetails}
        />
        {(role === "superadmin" || role === "admin") && (
          <>
            <div className="py-2 text-lg font-medium">New Project</div>
            <div>
              <NewProjectsForm />
            </div>
          </>
        )}
        <NewProjectsCharts />
        {role === "superadmin" && (
          <>
            <ManagerActivityDetailsComponent />
          </>
        )}
      </div>:
      <div className="w-[95%]">
      <ProjectDetails data={project}/>
      </div>
      }
      <div></div>
    </div>
  );
};

export default Projects;
