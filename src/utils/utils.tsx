import { useMemo } from "react";
import { emailRegex } from "./regex";
import { ToastMessage } from "@/data/interface-data";
import { toast } from "react-toastify";
import Dashboard from "@/components/dashboard/dashboard";
import Projects from "@/components/dashboard/Projects/projects";
import Activity from "@/components/dashboard/Activity/activity";
export const validateEmail = (value: string): boolean => emailRegex.test(value);
export const useEmailValidation = (value: string): boolean =>
  useMemo(() => {
    if (value === "") return true;
    return validateEmail(value);
  }, [value]);
export const showToastMessage = ({
  type,
  message,
  position = "top-right",
}: ToastMessage) => {
  if (type === "success") {
    toast.success(message, {
      position: "top-right",
      className: "z-50",
      style: {
        zIndex: 9999,
      },
    });
  }
  if (type === "error") {
    toast.error(message, {
      position: "top-right",
    });
  }
  if (type === "warning") {
    toast.warning(message, {
      position: "top-right",
    });
  }
  if (type === "info") {
    toast.info(message, {
      position: "top-right",
    });
  }
};
export const tabUtil = (tab: string, user: string) => {
  if (tab === "Dashboard") {
    return <Dashboard />;
  } else if (tab === "Projects") {
    return <Projects role={user} />;
  } else if (tab === "Activity") {
    return <Activity role={user} />;
  } 
  // else if (tab === "Users") {
    // return <Users role={user} />;
  // }
};
