import { useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import AuthContext from "@/context/AuthContext";
import { getData } from "@/core/api/apiHandler";
import {
  activityStatusRoutes,
  enquiryProcessStatusRoutes,
} from "@/core/api/apiRoutes";

const roleStatusMap: Record<string, string[]> = {
  Associate: ["Submitted"],
  Admin: ["Qouted", "Rejected", "Suspended", "Blocked", "Approved"],
  ProjectManager: ["Submitted", "Rejected", "Suspended", "Blocked", "Approved"],
  ActivityManager: ["Submitted", "Rejected", "Suspended"],
};

const useFilteredStatusOptions = () => {
  const { user } = useContext(AuthContext);

  // Fetch activity statuses
  const { data: statusData } = useQuery({
    queryKey: ["enquiryProcessStatus"],
    queryFn: () => getData(enquiryProcessStatusRoutes.getAll),
  });

  // Compute status options
  const filteredStatusOptions = useMemo(() => {
    const statusOptions =
      statusData?.data?.data?.data?.map((status: any) => ({
        key: status._id,
        label: status.name,
      })) || [];

    if (user?.role) {
      return statusOptions.filter((tab: any) =>
        roleStatusMap[user.role]?.includes(tab.label)
      );
    }

    return [];
  }, [statusData, user?.role]);

  return filteredStatusOptions;
};

export default useFilteredStatusOptions;
