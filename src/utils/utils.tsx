import { useMemo } from "react";
import { emailRegex } from "./regex";
import { ToastMessage } from "@/data/interface-data";
import { toast } from "react-toastify";
import { FiUsers } from "react-icons/fi";
import { RiFileAddLine } from "react-icons/ri";
import { MdDashboard } from "react-icons/md";
import { AiOutlineProduct } from "react-icons/ai";
import { MdOutlineSettingsInputComponent } from "react-icons/md";
import { GiBookAura } from "react-icons/gi";
import { GiBeamsAura } from "react-icons/gi";

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

export const sidebarOptions = [
  {
    name: "Dashboard", //Translate
    icon: <MdDashboard />,
    link: "/dashboard",
  },
  {
    name: "Users", //Translate
    icon: <GiBeamsAura />,
    link: "/dashboard/users",
  },
  {
    name: "Essentials", //Translate
    icon: <MdOutlineSettingsInputComponent />,
    link: "/dashboard/essentials",
  },
  {
    name: "Products", //Translate
    icon: <AiOutlineProduct />,
    link: "/dashboard/product",
  },
  {
    name: "Catalog", //Translate
    icon: <GiBookAura />,
    link: "/dashboard/catalog",
  },
  // {
  //   name: "Live Rates", //Translate
  //   icon: <MdOutlinePriceChange />,
  //   link: "/dashboard/rates",
  // },
  {
    name: "Enquires", //Translate
    icon: <RiFileAddLine />,
    link: "/dashboard/enquires",
  },
  // {
  //   name: "Bulk Add", //Translate
  //   icon: <RiFileAddLine />,
  //   link: "/dashboard/bulk",
  // },
];
