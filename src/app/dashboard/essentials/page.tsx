// pages/locations.tsx
"use client";

import React from "react";
import { Tabs, Tab, Spacer, Button } from "@nextui-org/react";
import Title from "@/components/titles";
import EssentialTabContent from "@/components/dashboard/Essentials/essential-tab-content";
import Link from "next/link";

export default function Essentials() {
  const [companyEssentials, setCompanyEssentials] =
    React.useState("generalIntent");
  const companyEssentialsTabs = [
    { key: "generalIntent", title: "General Intent" }, // Translate Title
    { key: "subIntent", title: "Sub Intent" }, // Translate Title
    { key: "companyBusinessModel", title: "Business Model" }, // Translate Title
    { key: "certification", title: "Certifications" }, // Translate Title
    { key: "companyFunction", title: "Company Functions" },
    { key: "companySubFunction", title: "Company Sub-Functions" },
    { key: "warehouse", title: "Warehouses" },
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
  const [enquiryEssentials, setEnquiryEssentials] = React.useState("enquiryProcessStatus");

  const enquiryTabs = [
    { key: "enquiryProcessStatus", title: "Enquiry Process" }, // Translate Title
  ];
  return (
    <div className="flex items-center justify-center w-full min-w-0 max-w-full">
      <div className="w-full min-w-0 max-w-full">
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
                <EssentialTabContent
                  essentialName={tab.key}
                  filter={
                    tab.key === "companyFunction" || tab.key === "companySubFunction"
                      ? { activeOnly: false }
                      : undefined
                  }
                />
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
          <div className="mt-4 rounded-xl border border-default-200/60 bg-content1/95 p-4">
            <p className="text-xs text-default-600">
              Incoterms and Payment Terms have moved to Payment Rules.
            </p>
            <Button as={Link} href="/dashboard/payments" size="sm" variant="flat" color="warning" className="mt-2">
              Open Payment Rules
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
