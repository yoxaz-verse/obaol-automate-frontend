"use client";
import React, { useState } from "react";
import ActivityDetailProgressComponent from "@/components/dashboard/Activity/activity-detail-progress-component";
import { activityColumns } from "@/data/content-data";
import CommonTable from "@/components/dashboard/Table/common-table";
import { activityTableData } from "@/data/content-data";
import { useRouter } from "next/navigation";

export default function ActivityIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const router = useRouter();
  function viewActivityDetails(data: any) {
    console.log(data)
    router.push(`/dashboard/activity/${data.id}`);
  }
  const [verifyactivity, setVerifyActivity] = useState(false);
  function verifyActivity(data: any) {
    console.log(data)
    setVerifyActivity(true)
  }
  return (
    <>
      <div className="w-[95%] p-8">
        <div className='flex flex-col gap-5'>
          <ActivityDetailProgressComponent />
          {children}
        </div>
        <div className='my-4'>
          <div className="py-2 text-lg font-medium">Activities List</div>
          <CommonTable
            TableData={activityTableData}
            columns={activityColumns}
            viewProjectDetails={viewActivityDetails}
            verifyActivity={verifyActivity}
          />
        </div>
      </div>
    </>
  )
}
