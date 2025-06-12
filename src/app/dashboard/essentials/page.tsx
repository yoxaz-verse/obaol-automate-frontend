// pages/locations.tsx
"use client";

import React from "react";
import { Tabs, Tab, Spacer } from "@nextui-org/react";
import Title from "@/components/titles";
import EssentialTabContent from "@/components/dashboard/Essentials/essential-tab-content";
import BulkAdd from "@/components/CurdTable/bulk-add";
import { locationRoutes } from "@/core/api/apiRoutes";

export default function Essentials() {
  const [projectTab, setProjectTab] = React.useState("projectStatus");

  return (
    <div className="flex items-center justify-center">
      <div className="w-[95%]">
        <div className="my-4">
          <Title title="Companies" />
          <EssentialTabContent essentialName="associateCompany" />
          <Spacer y={4} />
          {/* <Title title="Process Status" />{" "}
          <Tabs
            aria-label="Process Tabs"
            selectedKey={activityTab}
            onSelectionChange={(key) => setActivityTab(key as string)}
          >
            {activityTabs.map((tab) => (
              <Tab key={tab.key} title={tab.title}>
                {tab.key === "activityStatus" && (
                  <EssentialTabContent essentialName="activityStatus" />
                )}
                {tab.key === "activityType" && (
                  <EssentialTabContent essentialName="activityType" />
                )}
              </Tab>
            ))}
          </Tabs>
          <Spacer y={4} />
          <Title title="Designation" />
          <Tabs
            aria-label="Designation Tabs" // Translate
            selectedKey={projectTab}
            onSelectionChange={(key) => setProjectTab(key as string)}
          >
            {projectTabs.map((tab) => (
              <Tab key={tab.key} title={tab.title}>
                {tab.key === "projectStatus" && (
                  <EssentialTabContent essentialName="projectStatus" />
                )}
                {tab.key === "projectType" && (
                  <EssentialTabContent essentialName="projectType" />
                )}
              </Tab>
            ))}
          </Tabs> */}
          <Spacer y={4} />
        </div>
      </div>
    </div>
  );
}
