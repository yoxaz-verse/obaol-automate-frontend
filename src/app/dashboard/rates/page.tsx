// pages/locations.tsx
"use client";

import React from "react";
import { Tabs, Tab, Spacer, Accordion, AccordionItem } from "@heroui/react";
import Title from "@/components/titles";
import EssentialTabContent from "@/components/dashboard/Essentials/essential-tab-content";
import BulkAdd from "@/components/CurdTable/bulk-add";

export default function Essentials() {
  const [locationTab, setLocationTab] = React.useState("location");
  const [activityTab, setActivityTab] = React.useState("activityStatus");
  const [projectTab, setProjectTab] = React.useState("projectStatus");

  const productTabs = [
    { key: "location", title: "Product Variant" }, // Translate Title
    { key: "locationManager", title: "Product Associate" }, // Translate Title
    { key: "locationType", title: "Product Location" }, // Translate Title
  ];
  const defaultContent =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

  // Optionally, add dynamic tabs based on fetched data
  // For example, if ProjectStatus or ActivityStatus have sub-categories
  // For simplicity, we'll stick to static tabs in this example
  const refetchData = () => {
    // Implement refetch logic if necessary
  };

  return (
    <div className="flex items-center justify-center">
      <div className="w-[95%]">
        <div className="my-4">
          <div className="flex w-[100%]">
            <div className="w-[40%]">
              <Accordion variant="splitted">
                <AccordionItem key="1" aria-label="Spices" title="Spices">
                  <Accordion variant="shadow">
                    <AccordionItem
                      key="1"
                      aria-label="Ground Spices"
                      title="Ground Spices"
                    >
                      <Accordion variant="bordered">
                        <AccordionItem
                          key="1"
                          aria-label="Cardamom"
                          title="Cardamom"
                        >
                          {defaultContent}
                        </AccordionItem>
                        <AccordionItem
                          key="2"
                          aria-label="Black Pepper"
                          title="Black Pepper"
                        >
                          {defaultContent}
                        </AccordionItem>
                        <AccordionItem key="3" aria-label="Cumin" title="Cumin">
                          {defaultContent}
                        </AccordionItem>
                      </Accordion>
                    </AccordionItem>
                    <AccordionItem key="2" aria-label="Spices" title="Spices">
                      {defaultContent}
                    </AccordionItem>
                    <AccordionItem
                      key="3"
                      aria-label="Import Spices"
                      title="Import Spices"
                    >
                      {defaultContent}
                    </AccordionItem>
                  </Accordion>{" "}
                </AccordionItem>
                <AccordionItem key="2" aria-label="Rices" title="Rices">
                  {defaultContent}
                </AccordionItem>
                <AccordionItem key="3" aria-label="Pulses" title="Pulses">
                  {defaultContent}
                </AccordionItem>
              </Accordion>
            </div>
            <div className="w-[60%]">
              <Title title="Product Name" /> {/* Translate */}
              <Tabs
                aria-label="Location Tabs" // Translate
                selectedKey={locationTab}
                onSelectionChange={(key) => setLocationTab(key as string)}
              >
                {productTabs.map((tab) => (
                  <Tab key={tab.key} title={tab.title}>
                    {tab.key === "location" && (
                      // <LocationTabContent currentType="all" />
                      <>
                        {/* <BulkAdd
                          apiEndpoint={`${locationRoutes.getAll}/bulk`}
                          refetchData={refetchData} // Function to refetch activities list
                          currentTable={"Locations"} // Translate
                        /> */}
                        <Spacer y={6} />
                        <Accordion variant="light">
                          <AccordionItem
                            key="1"
                            aria-label="Cardamom 8mm"
                            title="Cardamom 8mm"
                          >
                            <EssentialTabContent essentialName="location" />
                          </AccordionItem>
                          <AccordionItem
                            key="2"
                            aria-label="Cardamom 7.5mm"
                            title="Cardamom 7.5mm"
                          >
                            {defaultContent}
                          </AccordionItem>
                          <AccordionItem
                            key="3"
                            aria-label="Cardamom 7mm"
                            title="Cardamom 7mm"
                          >
                            {defaultContent}
                          </AccordionItem>
                        </Accordion>{" "}
                        <Spacer y={6} />
                      </>
                    )}
                    {tab.key === "locationType" && (
                      <EssentialTabContent essentialName="locationType" />
                    )}
                    {tab.key === "locationManager" && (
                      <EssentialTabContent essentialName="locationManager" />
                    )}
                  </Tab>
                ))}
              </Tabs>{" "}
            </div>
          </div>
          <Spacer y={4} />
        </div>
      </div>
    </div>
  );
}
