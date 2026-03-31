"use client";

import React, { useState, useEffect } from "react";
import QueryComponent from "@/components/queryComponent";
import { Spacer } from "@nextui-org/react";
import { statusHistoryRoutes } from "@/core/api/apiRoutes";
import CommonTable from "../CurdTable/common-table";
import TableFrame from "../CurdTable/table-frame";
import { generateColumns, initialTableConfig } from "@/utils/tableValues";

interface StatusHistoryTabContentProps {
  entityId: string;
  entityType: "Location" | "Activity" | "Project";
  additionalParams?: Record<string, any>; // Accept additional filters if needed
}
const tableConfig = { ...initialTableConfig }; // Create a copy to avoid mutations
const columns = generateColumns("statusHistory", tableConfig);

const formatDateTime = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(dateString));
};

const StatusHistoryTabContent: React.FC<StatusHistoryTabContentProps> = ({
  entityId,
  entityType,
  additionalParams = {},
}) => {
  const [page, setPage] = useState(1);
  const limit = 25;

  useEffect(() => {
    setPage(1);
  }, [entityId, entityType, JSON.stringify(additionalParams || {})]);

  return (
    <>
      <Spacer y={5} />
      <QueryComponent
        api={statusHistoryRoutes.getAll}
        queryKey={["statusHistory", entityId, entityType, additionalParams, page]}
        page={page}
        limit={limit}
        additionalParams={{ entityId, entityType, ...(additionalParams || {}) }}
      >
        {(historyData: any, _refetch, meta) => {
          const formatChangedFields = (changedFields: any[]) => {
            return changedFields
              .filter(
                (field) =>
                  JSON.stringify(field.oldValue) !== JSON.stringify(field.newValue) &&
                  field.field !== "updatedAt" &&
                  field.field !== "createdAt"
              )
              .map(
                (field: any) =>
                  `${toTitleCase(field.field)} changed from '${field.oldValue}' to '${
                    field.newValue
                  }'`
              )
              .join(", ");
          };

          // Helper function to convert string to Title Case
          const toTitleCase = (str: string) => {
            return str.replace(/\w\S*/g, (txt) => {
              return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
          };

          const rows = Array.isArray(historyData) ? historyData : (historyData?.data || []);
          const tableData = rows.map((history: any, index: number) => ({
            id: history._id || `history-${index}`, // Ensure unique key
            changeType: history.changeType,
            previousStatus: history.previousStatus || "N/A",
            newStatus: history.newStatus || "N/A",
            changedBy: history.changedBy,
            changedFields: formatChangedFields(history.changedFields), // Format changed fields into a readable string
            changedRole: history.changedRole || "N/A",
            changedAt: formatDateTime(history.changedAt), // Format date
          }));

          return tableData.length > 0 ? (
            <TableFrame>
              <CommonTable
                TableData={tableData}
                columns={columns}
                isLoading={false}
                page={meta?.currentPage || page}
                totalPages={meta?.totalPages || 1}
                rowsPerPage={limit}
                onPageChange={(nextPage) => setPage(nextPage)}
              />
            </TableFrame>
          ) : (
            <div>{""}</div>
          );
        }}
      </QueryComponent>
    </>
  );
};

export default StatusHistoryTabContent;
