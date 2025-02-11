"use client";

import React, { useMemo } from "react";
import QueryComponent from "@/components/queryComponent";
import { Spacer } from "@nextui-org/react";
import { getData } from "@/core/api/apiHandler";
import { useQuery } from "@tanstack/react-query";
import { statusHistoryRoutes } from "@/core/api/apiRoutes";
import CommonTable from "../CurdTable/common-table";
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
  // Fetch status history data
  const { data: historyData } = useQuery({
    queryKey: ["statusHistory", entityId, entityType],
    queryFn: () =>
      getData(
        `${statusHistoryRoutes.getAll}?entityId=${entityId}&entityType=${entityType}`,
        additionalParams
      ),
  });

  const tableData = useMemo(() => {
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
    if (historyData?.data?.data) {
      return historyData.data.data.map((history: any, index: number) => ({
        id: history._id || `history-${index}`, // Ensure unique key
        changeType: history.changeType,
        previousStatus: history.previousStatus || "N/A",
        newStatus: history.newStatus || "N/A",
        changedBy: history.changedBy,
        changedFields: formatChangedFields(history.changedFields), // Format changed fields into a readable string
        changedRole: history.changedRole || "N/A",
        changedAt: formatDateTime(history.changedAt), // Format date
      }));
    }

    return [];
  }, [historyData]);

  return (
    <>
      <Spacer y={5} />
      {tableData.length > 0 ? (
        <CommonTable
          TableData={tableData}
          columns={columns}
          isLoading={!historyData}
        />
      ) : (
        <div>{""}</div>
      )}
    </>
  );
};

export default StatusHistoryTabContent;
