"use client";

import React, { useContext } from "react";
import { Spacer } from "@heroui/react";

import Title from "@/components/titles";
import AddModal from "@/components/CurdTable/add-model";
import QueryComponent from "@/components/queryComponent";
import CommonTable from "@/components/CurdTable/common-table";

import {
  apiRoutesByRole,
  generateColumns,
  initialTableConfig,
} from "@/utils/tableValues";
import AuthContext from "@/context/AuthContext";

/**
 * Basic interface for an Enquiry (example)
 */
interface IEnquiry {
  _id: string;
  phoneNumber: string;
  name: string;
  variantRate: string; // or object ID
  displayRate?: string | null;
  productVariant: string;
  mediatorAssociate?: string | null;
  realAssociate: string;
  createdAt?: string;
}

/**
 * The main Enquiry page
 */
export default function EnquiryPage() {
  // You might clone your table config so you can customize the "enquiry" fields
  const tableConfig = { ...initialTableConfig };

  let columns = generateColumns("enquiry", tableConfig);
  const { user } = useContext(AuthContext);

  /**
   * A callback to refetch data (if you are using React Query or invalidating queries).
   * Or you could pass a function to re-run local queries, etc.
   */
  const refetchData = React.useCallback(() => {
    // e.g. queryClient.invalidateQueries(["enquiry"]);
  }, []);

  return (
    <section>
      <Title title="Enquiry" />

      {/* 
        1) AddModal to create a new Enquiry.
           We'll pass the "enquiry" tableConfig fields plus an endpoint 
           to do a POST request.
       */}
      <AddModal
        currentTable="Enquiry"
        formFields={tableConfig["enquiry"]} // fields defined above
        apiEndpoint={apiRoutesByRole["enquiry"]} // e.g. "/api/enquiries"
        refetchData={refetchData}
      />

      <Spacer y={2} />

      {/* 
        2) We fetch the Enquiries list and display them in a CommonTable (or similar).
           We'll use a <QueryComponent> or you can do a direct custom fetch approach.
       */}

      <QueryComponent
        api={apiRoutesByRole["enquiry"]} // e.g. "/api/enquiries"
        queryKey={["enquiry"]}
        page={1}
        limit={50}
      >
        {(enquiryResponse: any) => {
          // Suppose your API returns { data: { data: IEnquiry[] } } or something similar
          // Adjust to your actual shape:
          const enquiriesData = enquiryResponse?.data || [];
          // Transform the rows if needed
          console.log(enquiriesData);
          const DDdata = [
            {
              _id: "67e2e8f3e1ed9d497293ee6e",
              phoneNumber: "452312",
              name: "Jacob",
              variantRate: {
                _id: "67d7f7963a643f0618596309",
                rate: 2121,
                selected: true,
                productVariant: "67d7f0903a643f06185961e1",
                associate: "67d7f77f3a643f06185962e1",
                isLive: true,
                createdAt: "2025-03-17T10:21:10.123Z",
                __v: 0,
                commission: 11,
              },
              displayRate: null,
              productVariant: {
                _id: "67d7f0903a643f06185961e1",
                name: "Cardamom 8mm",
                description: "A Quality",
                isAvailable: true,
                isLive: true,
                product: "67d7f0433a643f06185961da",
                createdAt: "2025-03-17T09:51:12.176Z",
                __v: 0,
              },
              mediatorAssociate: null,
              productAssociate: {
                _id: "67d7ef493a643f061859617e",
                name: "Athi K Ani",
                email: "athi@obaol.com",
                phone: "2313132231",
                phoneSecondary: "7306096942",
                associateCompany: "67d7ef183a643f0618596150",
                password:
                  "$2a$10$z2KIfq/x681L3/nXyDuw7uxY0mpkMYTx6yYNdMfRHufXKuNh757Z6",
                role: "Associate",
                createdAt: "2025-03-17T09:45:45.769Z",
                updatedAt: "2025-03-17T09:45:45.769Z",
                __v: 0,
              },
              createdAt: "2025-03-25T17:33:39.552Z",
              __v: 0,
            },
            {
              _id: "67e2e929e1ed9d497293eeaf",
              phoneNumber: "7306096941",
              name: "JACOB ALWIN",
              variantRate: {
                _id: "67d7f7963a643f0618596309",
                rate: 2121,
                selected: true,
                productVariant: "67d7f0903a643f06185961e1",
                associate: "67d7f77f3a643f06185962e1",
                isLive: true,
                createdAt: "2025-03-17T10:21:10.123Z",
                __v: 0,
                commission: 11,
              },
              displayRate: null,
              productVariant: {
                _id: "67d7f0903a643f06185961e1",
                name: "Cardamom 8mm",
                description: "A Quality",
                isAvailable: true,
                isLive: true,
                product: "67d7f0433a643f06185961da",
                createdAt: "2025-03-17T09:51:12.176Z",
                __v: 0,
              },
              mediatorAssociate: null,
              productAssociate: {
                _id: "67d7ef493a643f061859617e",
                name: "Athi K Ani",
                email: "athi@obaol.com",
                phone: "2313132231",
                phoneSecondary: "7306096942",
                associateCompany: "67d7ef183a643f0618596150",
                password:
                  "$2a$10$z2KIfq/x681L3/nXyDuw7uxY0mpkMYTx6yYNdMfRHufXKuNh757Z6",
                role: "Associate",
                createdAt: "2025-03-17T09:45:45.769Z",
                updatedAt: "2025-03-17T09:45:45.769Z",
                __v: 0,
              },
              createdAt: "2025-03-25T17:34:33.201Z",
              __v: 0,
            },
            {
              _id: "67e2ec96e1ed9d497293efa2",
              phoneNumber: "7306096941",
              name: "JJJOom ",
              variantRate: {
                _id: "67d7f6f13a643f0618596258",
                rate: 23450,
                selected: true,
                productVariant: "67d7f0903a643f06185961e1",
                associate: "67d7ef493a643f061859617e",
                isLive: true,
                createdAt: "2025-03-17T10:18:25.696Z",
                __v: 0,
                commission: 10,
              },
              displayRate: null,
              productVariant: {
                _id: "67d7f0903a643f06185961e1",
                name: "Cardamom 8mm",
                description: "A Quality",
                isAvailable: true,
                isLive: true,
                product: "67d7f0433a643f06185961da",
                createdAt: "2025-03-17T09:51:12.176Z",
                __v: 0,
              },
              mediatorAssociate: null,
              productAssociate: {
                _id: "67d7ef493a643f061859617e",
                name: "Athi K Ani",
                email: "athi@obaol.com",
                phone: "2313132231",
                phoneSecondary: "7306096942",
                associateCompany: "67d7ef183a643f0618596150",
                password:
                  "$2a$10$z2KIfq/x681L3/nXyDuw7uxY0mpkMYTx6yYNdMfRHufXKuNh757Z6",
                role: "Associate",
                createdAt: "2025-03-17T09:45:45.769Z",
                updatedAt: "2025-03-17T09:45:45.769Z",
                __v: 0,
              },
              createdAt: "2025-03-25T17:49:10.573Z",
              __v: 0,
            },
          ];
          const tableData = enquiriesData.map((item: any) => {
            const { isDeleted, isActive, password, __v, ...rest } = item;

            return {
              ...rest,
              // associate:
              //   item.associate._id === user?.id || user?.role === "Admin"
              //     ? item.associate.name
              //     : "OBAOL",
              // associateId: item.associate._id,
              // variantRate: item.variantRate.rate + item.variantRate.commission,
              // displayedRate:
              //   item.variantRate.rate + item.variantRate.displayRate.commission,
              product: item.productVariant.product.name,
              productVariant: item.productVariant.name,
              productAssociate: item.productAssociate.name,
              associateCompany: item.productAssociate.associateCompany.name,
              mediatorAssociate: item.mediatorAssociate?.name || "N/A",
            };
          });

          return (
            <section className="p-5">
              {/* <h2>All Enquiries</h2> */}
              <Spacer y={1} />
              <CommonTable TableData={tableData} columns={columns} />
              <Spacer y={1} />
            </section>
          );
        }}
      </QueryComponent>
    </section>
  );
}
