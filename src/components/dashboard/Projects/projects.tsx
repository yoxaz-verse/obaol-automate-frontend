"use client";
import React, { useEffect, useState } from "react";
import CommonTable from "../../CurdTable/common-table";
import { columns, tableData } from "@/data/content-data";
import NewProjectsForm from "./new-projects-form";
import NewProjectsCharts from "./new-projects-charts";
import ManagerActivityDetailsComponent from "./manager-activity-details";
import ProjectDetails from "./project-details";
import { Tab, Tabs } from "@nextui-org/react";
import NewLocationForm from "./new-location";
import LocationViewModal from "@/components/Modals/location-view";
import { useQuery } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import {
  locationRoutes,
  projectRoutes,
  statusRoutes,
  subStatusRoutes,
  userRoutes,
} from "@/core/api/apiRoutes";
import CommonDeleteModal from "@/components/Modals/Common-delete-modal";

const Projects = ({ role }: { role: string }) => {
  const [projectdetails, setProjectDetails] = useState(false);
  const [project, setProject] = useState({ id: "123" });
  function viewProjectDetails(data: any) {
    setProjectDetails(true);
    setProject(data);
  }

  const locationData = useQuery({
    queryKey: ["locationData"],
    queryFn: async () => {
      return await getData(locationRoutes.getAll, {});
    },
  });

  const projectData = useQuery({
    queryKey: ["projectData"],
    queryFn: async () => {
      return await getData(projectRoutes.getAll, {});
    },
  });

  const [projectId, setProjectId] = useState("");

  const locationColumns = [
    { name: "NAME", uid: "name" },
    { name: "IMAGE", uid: "image" },
    { name: "ACTIONS", uid: "actions2" },
  ];

  const projectColumns = [
    { name: "NAME", uid: "title" },
    { name: "STATUS", uid: "status" },
    { name: "SUB STATUS", uid: "subStatus" },
    { name: "ACTIONS", uid: "actions2" },
  ];

  const superAdminProjectColumns = [
    { name: "NAME", uid: "title" },
    { name: "CREATED BY", uid: "adminId" },
    { name: "STATUS", uid: "status" },
    { name: "SUB STATUS", uid: "subStatus" },
    { name: "ACTIONS", uid: "actions2" },
  ];

  return (
    <div className="flex items-center justify-center">
      {!projectdetails ? (
        <div className="w-[95%]">
          <Tabs aria-label="Options">
            <Tab key="project" title="Projects">
              <CommonTable
                TableData={projectData.data?.data?.data || []}
                isLoading={projectData.isLoading}
                columns={
                  role === "Super_Admin"
                    ? superAdminProjectColumns
                    : projectColumns
                }
                viewModal={(data: any) => {
                  return <LocationViewModal data={data} />;
                }}
                redirect={(data: any) => {
                  setProjectId(data._id);
                  setProjectDetails(true);
                }}
                deleteData={{
                  endpoint: projectRoutes.delete,
                  key: ["projectData"],
                  type: "project",
                }}
                deleteModal={(data: any) => {
                  return <CommonDeleteModal data={data} />;
                }}
              />
              {(role === "Super_Admin" || role === "Admin") && (
                <>
                  <div className="py-2 text-lg font-medium">New Project</div>
                  <div>
                    <NewProjectsForm />
                  </div>
                </>
              )}
            </Tab>
            <Tab key="location" title="Locations">
              <CommonTable
                TableData={locationData.data?.data?.data || []}
                isLoading={locationData.isLoading}
                columns={locationColumns}
                viewModal={(data: any) => {
                  return <LocationViewModal data={data} />;
                }}
                deleteData={{
                  endpoint: locationRoutes.delete,
                  key: ["locationData"],
                  type: "location",
                }}
                deleteModal={(data: any) => {
                  return <CommonDeleteModal data={data} />;
                }}
              />
              {(role === "Super_Admin" || role === "Admin") && (
                <>
                  <div className="py-2 text-lg font-medium">New Location</div>
                  <div>
                    <NewLocationForm />
                  </div>
                </>
              )}
            </Tab>
          </Tabs>

          <NewProjectsCharts />
          {role === "Super_Admin" && (
            <>
              <ManagerActivityDetailsComponent />
            </>
          )}
        </div>
      ) : (
        <div className="w-[95%]">
          <ProjectDetails
            id={projectId}
            role={role}
            setProjectDetail={(value) => setProjectDetails(value)}
          />
        </div>
      )}
      <div></div>
    </div>
  );
};

export default Projects;
