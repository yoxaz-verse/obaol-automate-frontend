"use client";

import React, { useState } from "react";
import { Select, SelectItem, Button } from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";
import { patchData } from "@/core/api/apiHandler";
import { showToastMessage } from "@/utils/utils";
import { StatusUpdateProps } from "@/data/interface-data";


const StatusUpdate: React.FC<StatusUpdateProps> = ({
  currentEntity,
  statusOptions,
  apiEndpoint,
  recordId,
  currentStatus,
  refetchData,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>(
    currentStatus.key
  );
  const [loading, setLoading] = useState(false);

  const updateStatus = useMutation({
    mutationFn: async () =>
      patchData(`${apiEndpoint}/${recordId}`, { status: selectedStatus }, {}),
    onSuccess: () => {
      showToastMessage({
        type: "success",
        message: `${currentEntity} status updated successfully`,
        position: "top-right",
      });
      setLoading(false);
      refetchData(); // Call the refetch function passed down
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message:
          error.response?.data?.message ||
          `Failed to update ${currentEntity} status`,
        position: "top-right",
      });
      setLoading(false);
    },
  });

  const handleSubmit = () => {
    if (selectedStatus !== currentStatus.key) {
      setLoading(true);
      updateStatus.mutate();
    } else {
      showToastMessage({
        type: "info",
        message: `No changes made to ${currentEntity} status`,
        position: "top-right",
      });
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Select
        className="w-[120px]"
        label={currentStatus.label}
        selectedKeys={new Set([selectedStatus])}
        onSelectionChange={(keys) =>
          setSelectedStatus(String(Array.from(keys)[0]))
        }
      >
        {statusOptions.map((option) => (
          <SelectItem key={option.key} value={option.key}>
            {option.label}
          </SelectItem>
        ))}
      </Select>
      {selectedStatus !== currentStatus.key && (
        <Button
          color="primary"
          onClick={handleSubmit}
          isLoading={loading}
          disabled={loading}
        >
          {loading ? "Updating..." : "Update"}
        </Button>
      )}
    </div>
  );
};

export default StatusUpdate;
