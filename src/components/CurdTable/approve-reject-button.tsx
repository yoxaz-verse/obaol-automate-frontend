import { Button, Tooltip } from "@nextui-org/react";
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
  const handleAction = async (action: "approve" | "reject") => {
    try {
      await axios.patch(`${apiRoutesByRole["researchedCompany"]}/${item._id}`, {
        isApproved: action === "approve",
        isRejected: action === "reject",
      });
      refetchData();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  return (
    <div className="flex gap-2">
      {!item.isApproved && !item.isRejected && (
        <>
          <Tooltip content="Approve">
            <span
              onClick={() => handleAction("approve")}
              className="text-lg text-success cursor-pointer active:opacity-50 hover:opacity-80 transition-opacity"
            >
              <FiCheck size={22} />
            </span>
          </Tooltip>
          <Tooltip content="Reject">
            <span
              onClick={() => handleAction("reject")}
              className="text-lg text-danger cursor-pointer active:opacity-50 hover:opacity-80 transition-opacity"
            >
              <FiXCircle size={22} />
            </span>
          </Tooltip>
        </>
      )}

      {item.isApproved && (
        <span className="text-green-500 font-medium">Approved</span>
      )}
      {item.isRejected && (
        <span className="text-red-500 font-medium">Rejected</span>
      )}
    </div>
  );
};

export default ApproveRejectButtons;
