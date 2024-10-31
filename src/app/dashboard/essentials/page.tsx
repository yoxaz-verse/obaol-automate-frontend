// pages/locations.tsx
"use client";

import React from "react";
import { Tabs, Tab, Spacer } from "@nextui-org/react";
import { getData } from "@/core/api/apiHandler";
import Title from "@/components/titles";
import EssentialTabContent from "@/components/dashboard/Essentials/essential-tab-content";

export default function Essentials() {
  const [locationTab, setLocationTab] = React.useState("locationType");
  const [activityTab, setActivityTab] = React.useState("activityStatus");
  const [projectTab, setProjectTab] = React.useState("projectStatus");

  // Define static tabs
  const projectTabs = [
    { key: "projectStatus", title: "Project Status" },
    { key: "projectType", title: "Project Types" },
  ];

  // Define static tabs
  const activityTabs = [
    { key: "activityStatus", title: "Activity Status" },
    { key: "activityType", title: "Activity Types" },
  ];

  const locationTabs = [
    { key: "locationManager", title: "Location Managers" },
    { key: "locationType", title: "Location Types" },
  ];

  // Optionally, add dynamic tabs based on fetched data
  // For example, if ProjectStatus or ActivityStatus have sub-categories
  // For simplicity, we'll stick to static tabs in this example

  return (
    <div className="flex items-center justify-center">
      <div className="w-[95%]">
        <div className="my-4">
          <Spacer y={4} />
          <Title title="Location" />
          <Tabs
            aria-label="Location Tabs"
            selectedKey={locationTab}
            onSelectionChange={(key) => setLocationTab(key as string)}
          >
            {locationTabs.map((tab) => (
              <Tab key={tab.key} title={tab.title}>
                {tab.key === "locationType" && (
                  <EssentialTabContent essentialName="locationType" />
                )}
                {tab.key === "locationManager" && (
                  <EssentialTabContent essentialName="locationManager" />
                )}
              </Tab>
            ))}
          </Tabs>
          <Spacer y={4} />
          <Title title="Activity" />{" "}
          <Tabs
            aria-label="Activity Tabs"
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
          <Title title="Service Company" />{" "}
          <EssentialTabContent essentialName="serviceCompany" />{" "}
          <Spacer y={4} />
          <Title title="Project" />{" "}
          <Tabs
            aria-label="Project Tabs"
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
          </Tabs>
        </div>
      </div>
    </div>
  );
}
