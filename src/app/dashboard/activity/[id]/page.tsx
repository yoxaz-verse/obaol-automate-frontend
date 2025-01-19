"use client";
import { NextPage } from "next";
import ActivityDetailCard from "@/components/dashboard/Activity/activity-card";
import QueryComponent from "@/components/queryComponent";
import { Tab, Tabs } from "@nextui-org/tabs";
import TimeSheetTabContent from "@/components/dashboard/TimeSheet/all-timesheet-tab-content";
import { usePathname } from "next/navigation";
import { useContext, useMemo, useState } from "react";
import AddModal from "@/components/CurdTable/add-model";
import { apiRoutesByRole, initialTableConfig } from "@/utils/tableValues";
import { Card, CardBody, Spacer } from "@nextui-org/react";
import ActivityFileCard from "@/components/dashboard/Activity/activity-file";
import AuthContext from "@/context/AuthContext";
import EditActivityCard from "@/components/dashboard/Activity/activity-edit-card";
import LocationDetailComponent from "@/components/dashboard/Location/location-detail-component";
import { getData } from "@/core/api/apiHandler";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { activityStatusRoutes } from "@/core/api/apiRoutes";
import StatusUpdate from "@/components/CurdTable/status-update";
import useFilteredStatusOptions from "@/utils/roleActivityStatus";

const ViewActivityById: NextPage = () => {
  const filteredStatusOptions = useFilteredStatusOptions();
  const { user } = useContext(AuthContext);
  const [currentTable, setCurrentTable] = useState(""); // Default tab
  const tabs = [
    { key: "", title: "All" },
    { key: "isPending", title: "Pending" },
    { key: "isAccepted", title: "Accepted" },
    { key: "isResubmitted", title: "Resubmitted" },
    { key: "isRejected", title: "Rejected" },
    // Add more tabs if needed, e.g., "Archived Projects"
  ];

  const pathname = usePathname().split("/").pop()?.toString() || ""; // Gets the current URL pathname
  const activityId = pathname || ""; // Replace with dynamic ID if available
  const current = "timeSheet";
  const tableConfig = { ...initialTableConfig }; // Create a copy to avoid mutations
  const queryClient = useQueryClient();
  const refetchData = () => {
    queryClient.invalidateQueries({
      queryKey: ["activityDetailData", activityId], // Corrected query key structure
    });
  };

  return (
    <>
      <QueryComponent
        api={`${apiRoutesByRole["activity"]}/${activityId}`} // API endpoint to fetch activity details
        queryKey={["activityDetailData", activityId]}
      >
        {(data: any) => (
          <section>
            <div className="flex flex-col lg:flex-row lg:justify-between">
              <div className="lg:w-[49%]">
                <ActivityDetailCard data={data} />

                <Spacer y={2} />
                {user?.role === "Admin" && (
                  <Card className="flex ">
                    <CardBody className=" flex-row justify-evenly items-center">
                      <div className="flex items-center gap-2">
                        Edit:{" "}
                        <EditActivityCard
                          currentTable={"activity"}
                          formFields={tableConfig["activity"]}
                          apiEndpoint={`${apiRoutesByRole["activity"]}/${activityId}`}
                          refetchData={refetchData}
                          initialValues={data}
                        />
                      </div>{" "}
                      <div className="flex items-center gap-2">
                        Status:{" "}
                        {filteredStatusOptions && (
                          <StatusUpdate
                            currentEntity="Activity"
                            statusOptions={filteredStatusOptions}
                            apiEndpoint={apiRoutesByRole["activity"]}
                            recordId={data._id}
                            currentStatus={{
                              key: data.status._id,
                              label: data.status.name,
                            }}
                            refetchData={refetchData} // ✅ Pass the refetch function here
                          />
                        )}
                      </div>
                    </CardBody>
                  </Card>
                )}
              </div>

              <div className="lg:w-[49%] mt-4 lg:mt-0">
                <div className="w-full  lg:h-full">
                  <LocationDetailComponent data={data.project} />
                </div>
              </div>
            </div>
          </section>
        )}
      </QueryComponent>{" "}
      <ActivityFileCard
        activityId={activityId}
        user={user}
        // apiEndpoint={apiRoutesByRole["activityFile"]}
      />
      <div className="my-4">
        <AddModal
          currentTable={current}
          formFields={tableConfig[current]} // Pass the updated formFields
          apiEndpoint={`${apiRoutesByRole[current]}`}
          additionalVariable={{ activity: activityId }}
        />{" "}
        <Spacer y={6} />
        <Tabs
          aria-label="TimeSheet Tabs"
          selectedKey={currentTable}
          onSelectionChange={(key) => setCurrentTable(key as string)}
        >
          {tabs.map((tab) => (
            <Tab key={tab.key} title={tab.title}>
              <TimeSheetTabContent
                currentTable={current}
                activityId={activityId}
                isMode={tab.key}
                user={user}
              />
            </Tab>
          ))}
        </Tabs>
      </div>
    </>
  );
};

export default ViewActivityById;
