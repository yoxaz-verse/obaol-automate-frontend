import React, { useState } from "react";
import CommonTable from "../Table/common-table";
import { Button, Tab, Tabs } from "@nextui-org/react";
import AddUsers from "./add-users";
import { useQuery } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import { userRoutes } from "@/core/api/apiRoutes";
import UserDetailsModal from "@/components/Modals/user-details";
import UserDeleteModal from "@/components/Modals/user-delete";

const UsersComponent = ({ role }: { role: string }) => {
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
  const [currentRole, setCurrentRole] = useState('Admin');

  const userByRoleData = useQuery({
    queryKey: ['userByRoleData', currentRole],
    queryFn: async () => {
      return await getData(userRoutes.getByRole + currentRole, {})
    }
  })
  const columns = [
    { name: "NAME", uid: "name" },
    { name: "EMAIL", uid: "email" },
    { name: "CREATED AT", uid: "createdAt" },
    { name: "ACTIONS", uid: "actions2" },
  ];
  const roles = [
    {
      key: "Admin",
      title: "Admins"
    },
    {
      key: "Customer",
      title: "Customers"
    },
    {
      key: "Manager",
      title: "Managers"
    },
    {
      key: "Service",
      title: "Services"
    },
    {
      key: "Worker",
      title: "Workers"
    },
  ]
  return (
    <div>
      <div className="flex items-center justify-center">
        <div className="w-[95%]">
          <div className="my-4">
            <div className="py-2 text-lg font-medium"></div>
            <div className="flex w-full items-end justify-end"><AddUsers currentRole={currentRole} /></div>
            <Tabs aria-label="Options"
              onSelectionChange={(e) => {
                setCurrentRole(e as string)
              }
              }
            >


              {
                roles.map((data: any) => {
                  return <Tab key={data.key} title={data.title} onClick={() => {
                    setCurrentRole(data.key)
                  }}>
                    <CommonTable
                      TableData={
                        userByRoleData.data ? userByRoleData.data.data.data : []
                      }
                      columns={columns}
                      isLoading={userByRoleData.isLoading}
                      viewModal={
                        (data: any) => {
                          return <UserDetailsModal data={data} />
                        }
                      }
                      deleteModal={
                        (data: any) => {
                          return  <UserDeleteModal _id={data._id || ""} name={data.name || ""} role={data?.Role?.roleName || ""} />
                        }

                      }
                    />
                  </Tab>
                })
              }
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersComponent;
