// components/ServiceCompany/ServiceCompanyPage.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getData,
  postData,
  patchData,
  deleteData,
} from "@/core/api/apiHandler";
import QueryComponent from "@/components/queryComponent";
import { Spacer } from "@nextui-org/react";
import { showToastMessage } from "@/utils/utils";
import { serviceCompanyRoutes } from "@/core/api/apiRoutes";
import AddModal from "@/components/CurdTable/add-model";
import UserDeleteModal from "@/components/Modals/delete";
import CommonTable from "@/components/dashboard/Table/common-table";

const ServiceCompanyPage: React.FC = () => {
  const queryKey = ["serviceCompanies"];
  const [refetchFlag, setRefetchFlag] = useState(false);

  const refetchData = () => {
    setRefetchFlag(!refetchFlag);
  };

  const { data: serviceCompanyData, refetch } = useQuery({
    queryKey,
    queryFn: () => getData(serviceCompanyRoutes.getAll),
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Form fields for add/edit modal
  const formFields = [
    {
      label: "Name",
      type: "text",
      key: "name",
      inForm: true,
      inTable: true,
    },
    {
      label: "Address",
      type: "text",
      key: "address",
      inForm: true,
      inTable: true,
    },
    {
      label: "Description",
      type: "textarea",
      key: "description",
      inForm: true,
      inTable: false,
    },
    {
      label: "Map URL",
      type: "text",
      key: "map",
      inForm: true,
      inTable: false,
    },
    {
      label: "Website URL",
      type: "text",
      key: "url",
      inForm: true,
      inTable: true,
    },
    {
      label: "Active",
      type: "checkbox",
      key: "isActive",
      inForm: true,
      inTable: true,
    },
  ];

  // Define columns for the data table
  const columns = [
    { name: "NAME", uid: "name" },
    { name: "ADDRESS", uid: "address" },
    { name: "DESCRIPTION", uid: "description" },
    { name: "MAP URL", uid: "map" },
    { name: "WEBSITE URL", uid: "url" },
    { name: "ACTIVE", uid: "isActive" },
    { name: "CREATED AT", uid: "createdAt" },
    { name: "ACTIONS", uid: "actions" },
  ];

  return (
    <div className="flex items-center justify-center">
      <div className="w-[95%]">
        <div className="my-4">
          <AddModal
            currentTable="Service Company"
            formFields={formFields}
            apiEndpoint={serviceCompanyRoutes.getAll}
            refetchData={refetchData}
          />
          <Spacer y={5} />
          <QueryComponent
            api={serviceCompanyRoutes.getAll}
            queryKey={queryKey}
            page={1}
            limit={100}
          >
            {(data: any) => {
              const fetchedData = data?.data || [];
              const tableData = fetchedData.map((item: any) => ({
                ...item,
              }));

              return (
                <CommonTable
                  TableData={tableData}
                  columns={columns}
                  isLoading={false}
                  viewModal={(item: any) => (
                    // Implement view modal if needed
                    <div></div>
                  )}
                  deleteModal={(item: any) => (
                    <UserDeleteModal
                      _id={item._id}
                      name={item.name}
                      deleteApiEndpoint={serviceCompanyRoutes.delete}
                      refetchData={refetchData}
                    />
                  )}
                />
              );
            }}
          </QueryComponent>
        </div>
      </div>
    </div>
  );
};

export default ServiceCompanyPage;
