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
              specification: item.specification || "No Spec",
              product: item.productVariant.product.name,
              productVariant: item.productVariant.name,
              productAssociate: item.productAssociate?.name,
              associateCompany: item.productAssociate?.associateCompany.name,
              mediatorAssociate: item.mediatorAssociate?.name || "Direct",
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
