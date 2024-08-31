"use client";
import { useQuery } from "@tanstack/react-query";
import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { getData } from "../../../core/api/apiHandler";
import {
  authRoutes,
  locationRoutes,
  projectRoutes,
} from "../../../core/api/apiRoutes";
import CurdTable from "../../../components/CurdTable/CurdTable";
import ManagerActivityDetailsComponent from "@/components/dashboard/Projects/manager-activity-details";
import NewProjectsCharts from "@/components/dashboard/Projects/new-projects-charts";
import ProjectDetails from "@/components/dashboard/Projects/project-details";
import LocationViewModal from "@/components/Modals/location-view";
import Title from "@/components/titles";
import { Tab, Tabs, useDisclosure } from "@nextui-org/react";
import { ROLE } from "@/components/Login/login-component";
import ProjectModal from "@/components/Modal/ProjectModal";
import NewLocationForm from "@/components/dashboard/Projects/new-location";
import CommonDeleteModal from "@/components/Modals/Common-delete-modal";
import EditLocation from "@/components/Modals/edit-location";
import EditProject from "@/components/Modals/edit-project";

const Projects: NextPage = () => {
  const [projectdetails, setProjectDetails] = useState(false);
  const [project, setProject] = useState({ id: "123" });
  function viewProjectDetails(data: any) {
    setProjectDetails(true);
    setProject(data);
  }
  const [role, setRole] = useState<any>();
  const locationData = useQuery({
    queryKey: ["locationData"],
    queryFn: async () => {
      return await getData(locationRoutes.getAll, {});
    },
  });
  const { data: userData, isFetched: afterFetching } = useQuery({
    queryKey: ["userData"],
    queryFn: async () => {
      return await getData(authRoutes.checkUser, {});
    },
  });

  useEffect(() => {
    if (afterFetching) {
      console.log(userData?.data?.user?.Role?.roleName);
      setRole(userData?.data?.data?.user?.Role?.roleName);
    }
  }, [afterFetching, userData]);

  const projectData = useQuery({
    queryKey: ["projectData"],
    queryFn: async () => {
      return await getData(projectRoutes.getAll, {});
    },
  });

  const [projectId, setProjectId] = useState("");

  const locationColumns = [
    { name: "NAME", uid: "name", type: "text" },
    { name: "IMAGE", uid: "image", text: "image" },
    { name: "ACTIONS", uid: "actions" },
  ];
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const projectColumns = [
    { name: "NAME", uid: "title", type: "text" },
    { name: "STATUS", uid: "status", type: "text" },
    { name: "ACTIONS", uid: "actions", type: "actions" },
  ];
  const {
    isOpen: isOpenLocation,
    onOpen: onOpenLocation,
    onOpenChange: onOpenChangeLocation,
  } = useDisclosure();
  const {
    isOpen: isOpenDeleteProject,
    onOpen: onOpenDeleteProject,
    onOpenChange: onOpenChangeDeleteProject,
  } = useDisclosure();
  const {
    isOpen: isOpenDeleteLocation,
    onOpen: onOpenDeleteLocation,
    onOpenChange: onOpenChangeDeleteLocation,
  } = useDisclosure();
  const {
    isOpen: isOpenEditLocation,
    onOpen: onOpenEditLocation,
    onOpenChange: onOpenChangeEditLocation,
  } = useDisclosure();
  const {
    isOpen: isOpenEditProject,
    onOpen: onOpenEditProject,
    onOpenChange: onOpenChangeEditProject,
  } = useDisclosure();

  const superAdminProjectColumns = [
    { name: "NAME", uid: "title", type: "text" },
    { name: "CREATED BY", uid: "adminId", type: "text" },
    { name: "STATUS", uid: "status", type: "text" },
    { name: "ACTIONS", uid: "actions", type: "actions" },
  ];
  const [data, setData] = useState<any>();
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState(1);
  const handleView = (data: any) => {
    setData(data);
    onOpen();
  };
  const handleEditLocation = (data: any) => {
    alert("Edit");
    setData(data);
    onOpenEditLocation();
  };
  const handleEditProject = (data: any) => {
    setData(data);
    onOpenEditProject();
  };
  const handleViewLocation = (data: any) => {
    setData(data);
    onOpenLocation();
  };
  const handleDeleteLocation = (data: any) => {
    setData(data);
    onOpenDeleteLocation();
  };
  const handleDeleteProject = (data: any) => {
    setData(data);
    onOpenDeleteProject();
  };

  const tabs = ["Status 1", "Status 2", "Status 3"];
  return (
    <div className="flex items-center justify-center">
      {!projectdetails ? (
        <div className="w-full p-[1rem]">
          <Title title="Projects" />
          <Tabs aria-label="Options" color="secondary" variant="bordered">
            {tabs.map((t: any) => {
              return (
                <Tab
                  key={t}
                  title={
                    <div className="flex items-center space-x-2">
                      <span>{t}</span>
                    </div>
                  }
                >
                  <>
                    <CurdTable
                      setPage={(page) => setPage(page)}
                      api={projectRoutes.getAll}
                      limit={limit}
                      page={page}
                      title={t}
                      columns={
                        ROLE === "Admin"
                          ? superAdminProjectColumns
                          : projectColumns
                      }
                      onOpenCreate={() => {}}
                      onOpenEdit={(data: any) => handleEditProject(data)}
                      onOpenView={(data: any) => handleViewLocation(data)}
                      onOpenDelete={(data: any) => handleDeleteProject(data)}
                      queryKey={["project"]}
                      AddModal={<ProjectModal />}
                    />
                  </>
                </Tab>
              );
            })}
          </Tabs>
          <LocationViewModal
            isOpen={isOpenLocation}
            onOpenChange={onOpenChangeLocation}
            data={data}
          />
          <CommonDeleteModal
            data={data}
            isOpen={isOpenDeleteProject}
            onOpenChange={onOpenChangeDeleteProject}
          />
          <EditLocation
            data={data}
            isOpen={isOpenEditLocation}
            onOpenChange={onOpenChangeEditLocation}
          />
          <EditProject
            data={data}
            isOpen={isOpenEditProject}
            onOpenChange={onOpenChangeEditProject}
          />
          <CommonDeleteModal
            data={data}
            isOpen={isOpenDeleteLocation}
            onOpenChange={onOpenChangeDeleteLocation}
          />
          <CurdTable
            setPage={(page) => setPage(page)}
            api={locationRoutes.getAll}
            limit={limit}
            page={page}
            title="Location"
            columns={locationColumns}
            onOpenCreate={() => {}}
            onOpenEdit={(data: any) => handleEditLocation(data)}
            onOpenView={(data: any) => handleViewLocation(data)}
            onOpenDelete={(data: any) => handleDeleteLocation(data)}
            queryKey={["location"]}
            AddModal={<NewLocationForm />}
          />

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
