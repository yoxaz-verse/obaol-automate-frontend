// pages/locations.tsx
"use client";

import React from "react";
import { Tabs, Tab, Spacer } from "@nextui-org/react";
import Title from "@/components/titles";
import EssentialTabContent from "@/components/dashboard/Essentials/essential-tab-content";

export default function Essentials() {
  const [companyEssentials, setCompanyEssentials] =
    React.useState("generalIntent");
  const companyEssentialsTabs = [
    { key: "generalIntent", title: "General Intent" }, // Translate Title
    { key: "subIntent", title: "Sub Intent" }, // Translate Title
    { key: "companyBusinessModel", title: "Business Model" }, // Translate Title
    { key: "certification", title: "Certifications" }, // Translate Title
  ];
  const [company, setCompany] = React.useState("associateCompany");
  const companyTabs = [
    { key: "associateCompany", title: "Associates Company" }, // Translate Title
    { key: "researchedCompany", title: "Researched Company" }, // Translate Title
    { key: "companyType", title: "Company Type" }, // Translate Title
    { key: "companyStage", title: "Company Stage" }, // Translate Title
  ];

  const [userEssentials, setUserEssentials] = React.useState("designation");
  const userEssentialsTabs = [
    { key: "designation", title: "Designation" }, // Translate Title
    { key: "jobRole", title: "Job Role" }, // Translate Title
    { key: "jobType", title: "Job Type" }, // Translate Title
    { key: "language", title: "Language" }, // Translate Title
  ];
  const [enquiryEssentials, setEnquiryEssentials] = React.useState("designenquiryProcessStatusation");

  const enquiryTabs = [
    { key: "enquiryProcessStatus", title: "Enquiry Process" }, // Translate Title
    { key: "incoterm", title: "Incoterms" }, // Preferred trade terms
  ];
  return (
    <div className="flex items-center justify-center">
      <div className="w-full">
        <div className="">
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
            aria-label="Essentials Tabs" // Translate
            selectedKey={companyEssentials}
            onSelectionChange={(key) => setCompanyEssentials(key as string)}
          >
            {companyEssentialsTabs.map((tab) => (
              <Tab key={tab.key} title={tab.title}>
                <Title title={tab.title} />
                <EssentialTabContent essentialName={tab.key} />
              </Tab>
            ))}
          </Tabs>
          <Tabs
            aria-label="User Essentials Tabs" // Translate
            selectedKey={userEssentials}
            onSelectionChange={(key) => setUserEssentials(key as string)}
          >
            {userEssentialsTabs.map((tab) => (
              <Tab key={tab.key} title={tab.title}>
                <Title title={tab.title} />
                <EssentialTabContent essentialName={tab.key} />
              </Tab>
            ))}
          </Tabs>
          <Spacer y={4} />
          <Tabs
            aria-label="Enquiry Essentials Tabs"
            selectedKey={enquiryEssentials}
            onSelectionChange={(key) => setEnquiryEssentials(key as string)}

          >
            {enquiryTabs.map((tab) => (
              <Tab key={tab.key} title={tab.title}>
                <Title title={tab.title} />
                <EssentialTabContent essentialName={tab.key} />
              </Tab>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
