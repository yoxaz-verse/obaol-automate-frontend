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
    currentStatus.label
  );
  const [loading, setLoading] = useState(false);

  // Mutation for updating status
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

  // Handle form submission
  const handleSubmit = () => {
    if (selectedStatus !== currentStatus.label) {
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
      {/* Select Dropdown */}
      <Select
        className="w-[120px]"
        label={selectedStatus}
        selectedKeys={new Set([selectedStatus])}
        onSelectionChange={(keys) => {
          const selectedKey = Array.from(keys)[0];
          const selectedOption = statusOptions.find(
            (option) => option.label === selectedKey
          );
          if (selectedOption) {
            setSelectedStatus(selectedOption.label); // Use the label for backend
          }
        }}
      >
        {statusOptions.map((option) => (
          <SelectItem key={option.label} value={option.label}>
            {option.label}
          </SelectItem>
        ))}
      </Select>

      {/* Update Button */}
      {selectedStatus !== currentStatus.label && (
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
