// pages/locations.tsx
"use client";
import React from "react";
import { Tabs, Tab } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import { locationTypeRoutes } from "@/core/api/apiRoutes";
import LocationTypeTabContent from "@/components/dashboard/Essentials/location-type-tab-content";
import LocationTabContent from "@/components/dashboard/Location/location-tab-content";
import LocationManagerTabContent from "@/components/dashboard/Essentials/location-manager-tab-content";

export default function LocationPage() {
  const [currentTab, setCurrentTab] = React.useState("locationType");

  // Fetch LocationTypes
  const { data, isLoading, isError } = useQuery({
    queryKey: ["locationType"],
    queryFn: () => getData(locationTypeRoutes.getAll),
  });

  const locationTypes = data?.data.data.data || [];
  console.log(locationTypes);

  // Define static tabs
  const staticTabs = [{ key: "all", title: "All Location" }];

  // // Generate dynamic tabs based on LocationTypes
  const dynamicTabs = locationTypes.map((type: any) => ({
    key: type._id,
    title: type.name,
  }));
  console.log(dynamicTabs);
  const allTabs = [...staticTabs, ...dynamicTabs];

  return (
    <div className="flex items-center justify-center">
      <div className="w-[95%]">
        <div className="my-4">
          {isLoading ? (
            <div>Loading...</div>
          ) : isError ? (
            <div>Error loading Location Types</div>
          ) : (
            <Tabs
              aria-label="Location Types"
              selectedKey={currentTab}
              onSelectionChange={(key) => setCurrentTab(key as string)}
            >
              {allTabs.map((tab) => (
                <Tab key={tab.key} title={tab.title}>
                  {/* For dynamic location types */}
                  {tab.key !== "locationTypes" &&
                    tab.key !== "locationManager" && (
                      <LocationTabContent currentType={tab.key} />
                    )}
                </Tab>
              ))}
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
