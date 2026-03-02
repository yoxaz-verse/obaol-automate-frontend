import React, { useState, useEffect } from "react";
import { Tooltip } from "@nextui-org/react";
import { FiCheck, FiXCircle } from "react-icons/fi";
import { apiRoutesByRole } from "@/utils/tableValues";
import axios from "axios";

const ApproveRejectButtons = ({
  item,
  refetchData,
}: {
  item: any;
  refetchData: () => void;
}) => {
  const [isApproved, setIsApproved] = useState(item.isApproved);
  const [isRejected, setIsRejected] = useState(item.isRejected);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsApproved(item.isApproved);
    setIsRejected(item.isRejected);
  }, [item.isApproved, item.isRejected]);

  const handleAction = async (action: "approve" | "reject") => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await axios.patch(`${apiRoutesByRole["researchedCompany"]}/${item._id}`, {
        isApproved: action === "approve",
        isRejected: action === "reject",
      });
      setIsApproved(action === "approve");
      setIsRejected(action === "reject");
      refetchData();
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      {!isApproved && !isRejected && (
        <>
          <Tooltip content="Approve">
            <span
              onClick={() => handleAction("approve")}
              className={`text-lg text-success cursor-pointer transition-opacity ${isLoading ? "opacity-50 pointer-events-none" : "hover:opacity-80 active:opacity-50"}`}
            >
              <FiCheck size={22} />
            </span>
          </Tooltip>
          <Tooltip content="Reject">
            <span
              onClick={() => handleAction("reject")}
              className={`text-lg text-danger cursor-pointer transition-opacity ${isLoading ? "opacity-50 pointer-events-none" : "hover:opacity-80 active:opacity-50"}`}
            >
              <FiXCircle size={22} />
            </span>
          </Tooltip>
        </>
      )}

      {isApproved && (
        <span className="text-green-500 font-medium">Approved</span>
      )}
      {isRejected && (
        <span className="text-red-500 font-medium">Rejected</span>
      )}
    </div>
  );
};

export default ApproveRejectButtons;
