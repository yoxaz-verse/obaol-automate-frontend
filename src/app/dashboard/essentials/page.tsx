// pages/locations.tsx
"use client";

import React from "react";
import { Tabs, Tab, Spacer } from "@nextui-org/react";
import Title from "@/components/titles";
import EssentialTabContent from "@/components/dashboard/Essentials/essential-tab-content";

export default function Essentials() {
  const [userOption, setuserOption] = React.useState("projectStatus");
  const userOptionTabs = [
    { key: "designation", title: "Designation" }, // Translate Title
    { key: "enquiryProcessStatus", title: "Enquiry Process" }, // Translate Title
  ];
  const [company, setCompany] = React.useState("projectStatus");
  const companyTabs = [
    { key: "associateCompany", title: "Associates Company" }, // Translate Title
    { key: "companyType", title: "Company Type" }, // Translate Title
  ];
  return (
    <div className="flex items-center justify-center">
      <div className="w-[95%]">
        <div className="my-4">
          <Tabs
            aria-label="Company Tabs" // Translate
            selectedKey={company}
            onSelectionChange={(key) => setCompany(key as string)}
          >
            {companyTabs.map((tab) => (
              <Tab key={tab.key} title={tab.title}>
                <Title title={tab.title} />
                <EssentialTabContent essentialName={tab.key} />
              </Tab>
            ))}
          </Tabs>
          <Spacer y={4} />
          <Tabs
            aria-label="Designation Tabs" // Translate
            selectedKey={userOption}
            onSelectionChange={(key) => setuserOption(key as string)}
          >
            {userOptionTabs.map((tab) => (
              <Tab key={tab.key} title={tab.title}>
                <Title title={tab.title} />
                <EssentialTabContent essentialName={tab.key} />
              </Tab>
            ))}
          </Tabs>
          <Spacer y={4} />
        </div>
      </div>
    </div>
  );
}
