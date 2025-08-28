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
                <section className="lg:flex gap-2">
                  <div className="lg:flex w-full gap-2">
                    <Card className="mb-5 w-full  lg:w-[400px] max-w-[400px]">
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

                        <span>Language Known :{profile.languageKnown}</span>
                        <span>Company :{profile.associateCompany?.name}</span>
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
                    <Card className="mb-5  w-full max-w-[800px]">
                      <CardHeader className="flex gap-3">
                        <Avatar
                          size="lg"
                          showFallback
                          name={profile.name}
                          src="https://images.unsplash.com/broken"
                        />
                        <div className="flex flex-col">
                          <p className="text-small text-default-500">
                            {profile.email}
                          </p>
                        </div>
                      </CardHeader>
                      <Divider />
                      <CardBody className="gap-2">
                        <span>Address :{profile.address}</span>
                        <span>City :{profile.city}</span>
                        <span>State :{profile.state}</span>{" "}
                        <span>Company :{profile.associateCompany?.name}</span>
                        <span>Joining Date :{profile.joiningDate}</span>
                        <span>Job Role :{profile.jobRole}</span>
                        <span>Job Type :{profile.jobType}</span>
                        <span>Working Hours :{profile.workingHours}</span>
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
                  </div>
                </section>
              );
            }}
          </QueryComponent>
        </div>{" "}
      </div>
    )
  );
}
