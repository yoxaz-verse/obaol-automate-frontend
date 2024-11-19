// "use client";
// import React, { useState } from "react";
// import ActivityDetailProgressComponent from "@/components/dashboard/Activity/activity-detail-progress-component";
// import {
//   activityColumns,
//   activityDetailCard,
//   activityTableData,
//   columns,
//   tableData,
// } from "@/data/content-data";
// import VerifyActivityModal from "@/components/dashboard/Activity/verify-activity-modal";
// import { NextPage } from "next";
// import { useRouter } from "next/navigation";

// const Activity: NextPage = () => {
//   const router = useRouter();
//   function viewActivityDetails(data: any) {
//     console.log(data);
//     router.push(`/dashboard/activity/${data.id}`);
//   }
//   const [verifyactivity, setVerifyActivity] = useState(false);
//   function verifyActivity(data: any) {
//     console.log(data);
//     setVerifyActivity(true);
//   }
//   return (
//     <>
//       <div className="flex items-center justify-center">
//         <div className="w-[95%]">
//           <ActivityDetailProgressComponent />
//           <div className="flex justify-between w-full pt-5 pb-2">
//             <div className="py-2 text-lg font-medium">Activities List</div>
//           </div>
//           {/* <CommonTable
//             TableData={activityTableData}
//             columns={activityColumns}
//             viewProjectDetails={viewActivityDetails}
//             verifyActivity={verifyActivity}
//           /> */}
//         </div>
//       </div>
//       <VerifyActivityModal
//         open={verifyactivity}
//         close={() => setVerifyActivity(false)}
//         activity={activityDetailCard}
//       />
//     </>
//   );
// };

// export default Activity;

// pages/projects.tsx
"use client";

import React from "react";
import { Tabs, Tab } from "@nextui-org/react";
import ProjectTabContent from "@/components/dashboard/Projects/all-projects-tab-content";
import ActivityTabContent from "@/components/dashboard/Activity/all-activity-tab-content";
import EssentialTabContent from "@/components/dashboard/Essentials/essential-tab-content";

export default function ProjectsPage() {
  const [currentTable, setCurrentTable] = React.useState("projects"); // Default tab

  const tabs = [
    { key: "timeSheet", title: "Time Sheet" },
    // Add more tabs if needed, e.g., "Archived Projects"
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-6xl">
        <div className="my-4">
          <Tabs
            aria-label="Activity Tabs"
            selectedKey={currentTable}
            onSelectionChange={(key) => setCurrentTable(key as string)}
          >
            {tabs.map((tab) => (
              <Tab key={tab.key} title={tab.title}>
                <EssentialTabContent essentialName={"timeSheet"} />
              </Tab>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
