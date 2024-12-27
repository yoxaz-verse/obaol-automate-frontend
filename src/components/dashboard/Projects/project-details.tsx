import React, { useContext, useState } from "react";
import ProjectDetailProgressComponent from "./project-detail-progress-component";
import ProjectDetailComponent from "./project-detail-component";
import { Button, Spacer, Spinner, Tab, Tabs } from "@nextui-org/react";
import UnderDevelopment from "@/components/hashed/under-development";
import ManagerActivityDetailsComponent from "./manager-activity-details";
import WorkerAnalyticsComponent from "./worker-analytics";
import { activityStatusRoutes, projectRoutes } from "@/core/api/apiRoutes";
import ActivityTabContent from "../Activity/all-activity-tab-content";
import { ProjectDetailProps } from "@/data/interface-data";
import QueryComponent from "@/components/queryComponent";
import AddActivity from "../Activity/add-activity";
import { apiRoutesByRole, initialTableConfig } from "@/utils/tableValues";
import AuthContext from "@/context/AuthContext";
import { getData } from "@/core/api/apiHandler";
import { useQuery } from "@tanstack/react-query";
import EditProject from "./project-edit-card";
import BulkAdd from "@/components/CurdTable/bulk-add";
import LocationDetailComponent from "../Location/location-detail-component";

const ProjectDetails = ({ id, role, setProjectDetail }: ProjectDetailProps) => {
  const [currentTable, setCurrentTable] = useState<string>("");
  const current = "activity";

  const tableConfig = { ...initialTableConfig }; // Create a copy to avoid mutations
  const { user } = useContext(AuthContext); // Get current user from context
  // Fetch project statuses using react-query
  const { data: activityStatusesResponse, isLoading } = useQuery({
    queryKey: ["activityStatuses"],
    queryFn: () => getData(activityStatusRoutes.getAll),
  });
  const activityStatuses = activityStatusesResponse?.data?.data?.data;

  const refetchData = () => {
    // Implement refetch logic if necessary
  };
  return (
    <>
      <div className="flex justify-between items-center py-5 ">
        <div className="text-lg font-bold">Project Details</div>
        {/* <Button
          className="cursor-pointer"
          color="secondary"
          onPress={() => setProjectDetail(false)}
        >
          Back
        </Button> */}
      </div>
      <div className="w-full flex flex-col gap-5">
        {/* Wrap Project Details Query */}
        <QueryComponent
          api={`${projectRoutes.getAll}/${id}`}
          queryKey={["projectDetailsData", id]}
        >
          {(data) => (
            <>
              <>
                {/* <ProjectDetailProgressComponent data={data} /> */}
                <Spacer y={2} />
                <div className="lg:flex w-full justify-between gap-2">
                  <ProjectDetailComponent data={data} />
                  <LocationDetailComponent data={data} />
                </div>{" "}
                {user?.role === "Admin" && (
                  <EditProject
                    currentTable={"projects"}
                    formFields={tableConfig["projects"]}
                    apiEndpoint={`${apiRoutesByRole["projects"]}/${id}`}
                    refetchData={refetchData}
                    initialValues={data}
                  />
                )}
              </>
            </>
          )}
        </QueryComponent>

        <div className="w-full justify-between flex pt-10 pb-2 items-center">
          <div className="font-bold text-xl">Activities List</div>
          {/* <AddNewActivityModal id={id} /> */}
        </div>
        <Spacer y={2} />
        {user?.role === "Admin" && (
          <BulkAdd
            apiEndpoint={`${apiRoutesByRole[current]}/bulk`}
            refetchData={refetchData} // Function to refetch activities list
            currentTable={"Activities"}
          />
        )}
        <Spacer y={5} />
        <div className="my-4">
          {/* AddModal for adding new entries */}
          {user?.role === "Admin" && (
            <AddActivity
              currentTable={current}
              formFields={tableConfig[current]} // Pass the updated formFields
              apiEndpoint={apiRoutesByRole[current]}
              refetchData={refetchData}
              additionalVariable={{ project: id }}
            />
          )}{" "}
          <Spacer y={2} />
          {isLoading ? (
            <p>
              {" "}
              <Spinner
                label={`loading ${current} `}
                color="default"
                labelColor="foreground"
              />
            </p>
          ) : activityStatuses && activityStatuses.length > 0 ? (
            <Tabs
              aria-label="Activity Tabs"
              selectedKey={currentTable || activityStatuses[0]._id} // Default to the first tab if none selected
              onSelectionChange={(key) => setCurrentTable(key as string)}
            >
              <Tab key={0} title="All">
                <ActivityTabContent
                  currentTable={current}
                  tableConfig={tableConfig}
                  projectId={id}
                  user={user}
                />
              </Tab>{" "}
              {activityStatuses.map((status: { _id: string; name: string }) => (
                <Tab key={status._id + 1} title={status.name}>
                  <ActivityTabContent
                    selectedTab={status._id}
                    currentTable={current}
                    tableConfig={tableConfig}
                    projectId={id}
                    user={user}
                  />
                </Tab>
              ))}
            </Tabs>
          ) : (
            <p>No project statuses found.</p>
          )}
        </div>

        <UnderDevelopment>
          <ManagerActivityDetailsComponent />
          <WorkerAnalyticsComponent />
        </UnderDevelopment>
      </div>
    </>
  );
};

export default ProjectDetails;
