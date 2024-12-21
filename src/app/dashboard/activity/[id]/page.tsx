"use client";
import { NextPage } from "next";
import ActivityDetailCard from "@/components/dashboard/Activity/activity-card";
import QueryComponent from "@/components/queryComponent";
import { Tab, Tabs } from "@nextui-org/tabs";
import TimeSheetTabContent from "@/components/dashboard/TimeSheet/all-timesheet-tab-content";
import { usePathname } from "next/navigation";
import { useContext, useState } from "react";
import AddModal from "@/components/CurdTable/add-model";
import { apiRoutesByRole, initialTableConfig } from "@/utils/tableValues";
import { Card, Spacer } from "@nextui-org/react";
import ActivityFileCard from "@/components/dashboard/Activity/activity-file";
import AuthContext from "@/context/AuthContext";
import EditActivityCard from "@/components/dashboard/Activity/activity-edit-card";
const refetchData = () => {
  // Implement refetch logic if necessary
};
const ViewActivityById: NextPage = () => {
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
                {user?.role === "Admin" && (
                  <EditActivityCard
                    currentTable={"activity"}
                    formFields={tableConfig["activity"]}
                    apiEndpoint={`${apiRoutesByRole["activity"]}/${activityId}`}
                    refetchData={refetchData}
                    initialValues={data}
                  />
                )}
              </div>

              <div className="lg:w-[49%] mt-4 lg:mt-0">
                <div className="w-full h-[400px] lg:h-full">
                  <iframe
                    src={
                      data?.project.location.map ||
                      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6139551.5283225225!2d12.712159999999988!3d41.290850000000006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12d4fe82448dd203%3A0xe22cf55c24635e6f!2sItaly!5e0!3m2!1sen!2sin!4v1733584106237!5m2!1sen!2sin"
                    }
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
            <Spacer y={10} />
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
          refetchData={refetchData}
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
