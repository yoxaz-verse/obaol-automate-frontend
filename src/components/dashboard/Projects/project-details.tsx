import React, { useState } from "react";
import ProjectDetailProgressComponent from "./project-detail-progress-component";
import ProjectDetailComponent from "./project-detail-component";
import { Button, Spacer, Tab, Tabs } from "@nextui-org/react";
import UnderDevelopment from "@/components/hashed/under-development";
import ManagerActivityDetailsComponent from "./manager-activity-details";
import WorkerAnalyticsComponent from "./worker-analytics";
import { activityRoutes, projectRoutes } from "@/core/api/apiRoutes";
import ActivityTabContent from "../Activity/all-activity-tab-content";
import { ProjectDetailProps } from "@/data/interface-data";
import QueryComponent from "@/components/queryComponent";

const ProjectDetails = ({ id, role, setProjectDetail }: ProjectDetailProps) => {
  const [currentTable, setCurrentTable] = useState("projects"); // Default tab

  const tabs = [
    { key: "activity", title: "Activity" },
    // Add more tabs if needed, e.g., "Archived Projects"
  ];

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
          queryKey={["projectDetailsData YO Yo", id]}
        >
          {(data) => (
            <>
              <>
                <ProjectDetailProgressComponent data={data} />
                <Spacer y={2} />
                <ProjectDetailComponent data={data} />
              </>
            </>
          )}
        </QueryComponent>

        <div className="w-full justify-between flex pt-10 pb-2 items-center">
          <div className="font-bold text-xl">Activities List</div>
          {/* <AddNewActivityModal id={id} /> */}
        </div>

        <div className="my-4">
          <Tabs
            aria-label="Activity Tabs"
            selectedKey={currentTable}
            onSelectionChange={(key) => setCurrentTable(key as string)}
          >
            {tabs.map((tab) => (
              <Tab key={tab.key} title={tab.title}>
                <ActivityTabContent currentTable={tab.key} projectId={id} />
              </Tab>
            ))}
          </Tabs>
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
