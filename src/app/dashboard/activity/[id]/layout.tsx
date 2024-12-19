"use client";
import React, { useState } from "react";
import ActivityDetailProgressComponent from "@/components/dashboard/Activity/activity-detail-progress-component";
import { activityColumns } from "@/data/content-data";
import CommonTable from "@/components/CurdTable/common-table";
import { activityTableData } from "@/data/content-data";
import { useRouter } from "next/navigation";
import { Spacer, Tab, Tabs } from "@nextui-org/react";
import Title, { SubTitle } from "@/components/titles";

export default function ActivityIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  function viewActivityDetails(data: any) {
    console.log(data);
    router.push(`/dashboard/activity/${data.id}`);
  }
  const [verifyactivity, setVerifyActivity] = useState(false);
  function verifyActivity(data: any) {
    console.log(data);
    setVerifyActivity(true);
  }
  const tabs = ["Status 1", "Status 2", "Status 3", "Status 4"];
  return (
    <>
      <div className="w-[95%] p-8">
        <div className="flex flex-col gap-5">
          {/* <ActivityDetailProgressComponent /> */}
          {children}
        </div>
        <Spacer y={4} />
        <>
          {/* <Title title="Activity Details" />
          <Tabs aria-label="Options" color="secondary" variant="bordered">
            {tabs.map((t: any) => {
              return <Tab key={t}
                title={
                  <div className="flex items-center space-x-2">
                    <span>{t}</span>
                  </div>
                }>
                <>
                  <SubTitle title={t} />
                  <CommonTable
                    TableData={activityTableData}
                    columns={activityColumns}
                    viewProjectDetails={viewActivityDetails}
                    verifyActivity={verifyActivity}
                  />
                </>
              </Tab>
            })}
          </Tabs> */}
        </>
      </div>
    </>
  );
}
