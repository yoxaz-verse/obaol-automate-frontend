"use client";
import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import QueryComponent from "@/components/queryComponent";
import { Spacer } from "@nextui-org/react";
import AddModal from "@/components/CurdTable/add-model";
import UserDeleteModal from "@/components/CurdTable/delete";
import CommonTable from "@/components/CurdTable/common-table";
import {
  apiRoutesByRole,
  generateColumns,
  initialTableConfig,
} from "@/utils/tableValues";

import DetailsModal from "@/components/CurdTable/details";
import DynamicFilter from "@/components/CurdTable/dynamic-filtering";
import EditModal from "@/components/CurdTable/edit-model";
import ApproveRejectButtons from "@/components/CurdTable/approve-reject-button";
import TableFrame from "@/components/CurdTable/table-frame";

const EssentialTabContent = ({
  essentialName,
  filter,
  hideAdd,
}: {
  essentialName: string;
  filter?: any;
  hideAdd?: boolean;
}) => {
  const queryClient = useQueryClient();
  const tableConfig = { ...initialTableConfig }; // Create a copy to avoid mutations
  const [filters, setFilters] = React.useState<Record<string, any>>({});
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const limit = 25;

  // ✅ Apply filter only when prop changes
  React.useEffect(() => {
    if (filter) {
      setFilters(filter);
    }
  }, [filter]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, JSON.stringify(filters || {}), essentialName]);

  const columns = generateColumns(essentialName, tableConfig);

  // const { data: stateResponse } = useQuery({
  //   queryKey: ["State"],
  //   queryFn: () => getData(stateRoutes.getAll, { limit: 10000 }),
  //   enabled: essentialName === "associateCompany",
  // });

  const refetchData = () => {
    queryClient.invalidateQueries({ queryKey: [essentialName] });
  };
  // Update filters from AddProject
  const handleFiltersUpdate = (updatedFilters: Record<string, any>) => {
    setFilters(updatedFilters); // Update the filters
  };
  // Form fields for add/edit modal

  // Define columns for the data table
  let formFields = tableConfig[essentialName];
  const sanitizeCompanyRecord = (record: Record<string, any>) => {
    if (!["associateCompany", "researchedCompany", "companyStage"].includes(essentialName)) {
      const { isDeleted, isActive, password, __v, ...rest } = record;
      return rest;
    }

    const allowedKeys = new Set(
      (formFields || [])
        .filter((field: any) => field.key !== "actions2")
        .map((field: any) => field.key)
    );
    const sanitized: Record<string, any> = { _id: record._id };
    allowedKeys.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(record, key)) sanitized[key] = record[key];
    });
    return sanitized;
  };
  const formatDetailsRecord = (record: Record<string, any>) => {
    const details = { ...record };
    (formFields || []).forEach((field: any) => {
      if (!Array.isArray(field.values) || !Object.prototype.hasOwnProperty.call(details, field.key)) return;
      const labels = new Map(field.values.map((option: any) => [String(option.key), option.value]));
      if (Array.isArray(details[field.key])) {
        details[field.key] = details[field.key].map((value: any) => labels.get(String(value)) || value);
      } else {
        details[field.key] = labels.get(String(details[field.key])) || details[field.key];
      }
    });
    return details;
  };

  return (
    <div className="w-full max-w-full min-w-0">
      <div className="min-w-0">
        <div className="my-4">
          <div className="flex items-center justify-between  gap-3">
            {!hideAdd && (
              <AddModal
                currentTable={essentialName}
                formFields={formFields}
                apiEndpoint={apiRoutesByRole[essentialName]}
                refetchData={refetchData}
              />
            )}{" "}
            {essentialName === "location" && (
              <DynamicFilter
                currentTable={essentialName}
                formFields={formFields}
                onApply={handleFiltersUpdate} // Pass the callback to DynamicFilter
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder={`Search ${essentialName}...`}
              />
            )}
          </div>{" "}
          <QueryComponent
            api={apiRoutesByRole[essentialName]}
            queryKey={[essentialName, apiRoutesByRole[essentialName], filters, debouncedSearch, page]}
            page={page}
            limit={limit}
            search={debouncedSearch}
            additionalParams={filters}
          >
            {(data: any, _refetch, meta) => {
              const fetchedData = Array.isArray(data) ? data : (data?.data || []);
              const tableData = fetchedData.map((item: any) => {
                const record = sanitizeCompanyRecord(item);
                // Helper function to join array of objects by `name`
                const joinNames = (arr: any[] = []) =>
                  arr.length > 0
                    ? arr.map((x) => x.name).join(", ")
                    : "Not Defined";

                if (essentialName === "associateCompany") {
                  const locationParts = [
                    item.district?.name,
                    item.state?.name
                  ].filter(Boolean);

                  return {
                    ...record,
                    location: locationParts.length > 0
                      ? locationParts.join(", ")
                      : "Unknown",
                  };
                }
                if (essentialName === "companySubFunction") {
                  return {
                    ...record,
                    functionName: item.functionId?.name || "Not Defined",
                  };
                }

                if (essentialName === "researchedCompany") {
                  const locationParts = [
                    item.district?.name,
                    item.state?.name
                  ].filter(Boolean);

                  return {
                    ...record,
                    location: locationParts.length > 0
                      ? locationParts.join(", ")
                      : "Unknown",
                    companyType: item.companyType?.name || "Not Defined",
                    companyStage: item.companyStage?.name || "Not Defined",
                    product: joinNames(item.product),
                    certification: joinNames(item.certification),
                    companyBusinessModel: joinNames(item.companyBusinessModel),
                    companyIntent: joinNames(item.companyIntent),
                  };
                }
                return record;
              });
              return (
                tableData.length > 0 && (
                  <>
                    <Spacer y={5} />
                    <TableFrame>
                      <CommonTable
                        TableData={tableData}
                        columns={columns}
                        isLoading={false}
                        page={meta?.currentPage || page}
                        totalPages={meta?.totalPages || 1}
                        rowsPerPage={limit}
                        onPageChange={(nextPage) => setPage(nextPage)}
                        viewModal={(item: any) => (
                          // Implement view modal if needed
                          <>
                            <DetailsModal
                              currentTable={essentialName}
                              data={formatDetailsRecord(item)}
                              columns={columns}
                            />
                          </>
                        )}
                        editModal={(item: any) => (
                          <EditModal
                            _id={item._id}
                            initialData={item}
                            currentTable={essentialName}
                            formFields={formFields}
                            apiEndpoint={apiRoutesByRole[essentialName]} // Assuming API endpoint for update
                            refetchData={refetchData}
                          />
                        )}
                        deleteModal={(item: any) => (
                          <UserDeleteModal
                            _id={item._id}
                            name={item.name}
                            deleteApiEndpoint={apiRoutesByRole[essentialName]}
                            refetchData={refetchData}
                          />
                        )}
                        otherModal={(item: any) =>
                          essentialName === "researchedCompany" && (
                            <ApproveRejectButtons
                              item={item}
                              refetchData={refetchData}
                            />
                          )
                        }
                      />
                    </TableFrame>
                  </>
                )
              );
            }}
          </QueryComponent>
        </div>
      </div>
    </div>
  );
};

export default EssentialTabContent;
