import React, { useState } from "react";
import CommonTable from "../Table/common-table";
import { columns, tableData } from "@/data/content-data";
import { Button, Tab, Tabs } from "@nextui-org/react";
import AddUsers from "./add-users";

const Users = ({ role }: { role: string }) => {
  function viewActivityDetails(data: any) {
    console.log(data);
    setNewActivity(true);
  }
  const [viewactivity, setNewActivity] = useState(false);
  const [verifyactivity, setVerifyActivity] = useState(false);
  const [activitydata, setActivityData] = useState();
  function verifyActivity(data: any) {
    console.log(data);
    setVerifyActivity(true);
  }
  return (
    <div>
      <div className="flex items-center justify-center">
        <div className="w-[95%]">
          <div className="my-4">
            <div className="py-2 text-lg font-medium"></div>
             <div className="flex w-full items-end justify-end"><AddUsers/></div>
            <Tabs aria-label="Options" >
           
              <Tab key="Admins" title="Admins">
                <CommonTable
                  TableData={tableData}
                  columns={columns}
                  viewProjectDetails={viewActivityDetails}
                  verifyActivity={verifyActivity}
                />
              </Tab>
              <Tab key="Customers" title="Customers">
                <CommonTable
                  TableData={tableData}
                  columns={columns}
                  viewProjectDetails={viewActivityDetails}
                  verifyActivity={verifyActivity}
                />
              </Tab>
              <Tab key="Managers" title="Managers">
                <CommonTable
                  TableData={tableData}
                  columns={columns}
                  viewProjectDetails={viewActivityDetails}
                  verifyActivity={verifyActivity}
                />
              </Tab>
              <Tab key="workers" title="Workers">
                <CommonTable
                  TableData={tableData}
                  columns={columns}
                  viewProjectDetails={viewActivityDetails}
                  verifyActivity={verifyActivity}
                />
              </Tab>
            </Tabs>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Users;
