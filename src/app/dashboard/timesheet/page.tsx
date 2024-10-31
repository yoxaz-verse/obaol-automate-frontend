"use client";
import React, { useState } from "react";
import ActivityDetailProgressComponent from "@/components/dashboard/Activity/activity-detail-progress-component";
import {
  activityColumns,
  activityDetailCard,
  activityTableData,
  columns,
  tableData,
} from "@/data/content-data";
import VerifyActivityModal from "@/components/dashboard/Activity/verify-activity-modal";
import { NextPage } from "next";
import { useRouter } from "next/navigation";

const Activity: NextPage = () => {
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
  return (
    <>
      <div className="flex items-center justify-center">
        <div className="w-[95%]">
          <ActivityDetailProgressComponent />
          <div className="flex justify-between w-full pt-5 pb-2">
            <div className="py-2 text-lg font-medium">Activities List</div>
          </div>
          {/* <CommonTable
            TableData={activityTableData}
            columns={activityColumns}
            viewProjectDetails={viewActivityDetails}
            verifyActivity={verifyActivity}
          /> */}
        </div>
      </div>
      <VerifyActivityModal
        open={verifyactivity}
        close={() => setVerifyActivity(false)}
        activity={activityDetailCard}
      />
    </>
  );
};

export default Activity;
