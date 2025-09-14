import { Button } from "@nextui-org/react";
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
          <Button
            size="sm"
            color="success"
            onClick={() => handleAction("approve")}
          >
            Approve
          </Button>
          <Button
            size="sm"
            color="danger"
            onClick={() => handleAction("reject")}
          >
            Reject
          </Button>
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
