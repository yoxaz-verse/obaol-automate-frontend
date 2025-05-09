// pages/Catalog.tsx
"use client";

import React, { useContext, useState } from "react";
import AuthContext from "@/context/AuthContext";
import {
  Avatar,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  User,
} from "@nextui-org/react";
import Link from "next/link";
import QueryComponent from "@/components/queryComponent";
import { apiRoutesByRole, initialTableConfig } from "@/utils/tableValues";
import EditModal from "@/components/CurdTable/edit-model";

export default function Product() {
  const { user } = useContext(AuthContext);

  const role = user?.role.toLowerCase();
  const tableConfig = { ...initialTableConfig }; // Create a copy to avoid mutations
  const refetchData = () => {
    // Implement refetch logic if necessary
  };
  return (
    role && (
      <div className="flex items-center justify-center m-10 ">
        <div className="w-full">
          <QueryComponent
            api={apiRoutesByRole[role] + "/" + user?.id}
            queryKey={[apiRoutesByRole[role]]}
            // additionalParams={filters}
          >
            {(data: any) => {
              const profile = data || [];
              let formFields = tableConfig[role];
              // const tableData = fetchedData.map((item: any) => ({
              //   ...item,
              // }));

              // const tableData = fetchedData.map((item: any) => {
              //   const { isDeleted, isActive, password, __v, ...rest } = item;

              //   // Handle other user types similarly if needed

              //   return rest;
              // });
              return (
                <Card className="max-w-[400px]">
                  <CardHeader className="flex gap-3">
                    <Avatar
                      size="lg"
                      showFallback
                      name={profile.name}
                      src="https://images.unsplash.com/broken"
                    />
                    <div className="flex flex-col">
                      <p className="text-md">{profile.name}</p>
                      <p className="text-small text-default-500">
                        {profile.email}
                      </p>
                    </div>
                  </CardHeader>
                  <Divider />
                  <CardBody className="gap-2">
                    <span>Phone :{profile.phone}</span>
                    <span>Phone Secondary :{profile.phoneSecondary}</span>
                    <span>Company :{profile.associateCompany?.name}</span>
                    <span>Role :{profile.role}</span>
                  </CardBody>
                  <Divider />
                  <CardFooter className="justify-between">
                    Forgot Password?
                    <EditModal
                      _id={profile._id}
                      initialData={profile}
                      currentTable={role}
                      formFields={formFields}
                      apiEndpoint={apiRoutesByRole[role]} // Assuming API endpoint for update
                      refetchData={refetchData}
                    />{" "}
                  </CardFooter>
                </Card>
              );
            }}
          </QueryComponent>
        </div>{" "}
      </div>
    )
  );
}
