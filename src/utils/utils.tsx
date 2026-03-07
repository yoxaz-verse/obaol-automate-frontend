import { useMemo } from "react";
import { emailRegex } from "./regex";
import { ToastMessage } from "@/data/interface-data";
import { toast } from "react-toastify";
import { FiUsers } from "react-icons/fi";
import { RiFileAddLine, RiUser2Fill } from "react-icons/ri";
import { MdDashboard, MdOutlinePriceChange, MdOutlineAccountTree } from "react-icons/md";
import { AiOutlineProduct } from "react-icons/ai";
import { MdOutlineSettingsInputComponent } from "react-icons/md";
import { GiBookAura } from "react-icons/gi";

import { LiaMapMarkedAltSolid } from "react-icons/lia";
import { GoOrganization } from "react-icons/go";
import { BsGlobeCentralSouthAsia } from "react-icons/bs";
import { SiGoogleforms } from "react-icons/si";
import { LuWarehouse } from "react-icons/lu";
import { FiShoppingBag } from "react-icons/fi";
import { FiClipboard } from "react-icons/fi";
import { FiCheckSquare } from "react-icons/fi";
import { FiBell } from "react-icons/fi";


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
    name: "Enquiries", //Translate
    icon: <RiFileAddLine />,
    link: "/dashboard/enquiries",
  },
  {
    name: "Products", //Translate
    icon: <AiOutlineProduct />,
    link: "/dashboard/product",
  },
  {
    name: "Marketplace",
    icon: <LuWarehouse />,
    link: "/dashboard/marketplace",
  },
  {
    name: "Catalog", //Translate
    icon: <GiBookAura />,
    link: "/dashboard/catalog",
  },
  {
    name: "Companies", //Translate
    icon: <GoOrganization />,
    link: "/dashboard/companyProduct",
  },
  {
    name: "Hierarchy",
    icon: <MdOutlineAccountTree />,
    link: "/dashboard/employee/hierarchy",
  },
  {
    name: "Team",
    icon: <FiUsers />,
    link: "/dashboard/employee/team",
  },
  {
    name: "Earnings",
    icon: <MdOutlinePriceChange />,
    link: "/dashboard/employee/earnings",
  },
  {
    name: "Orders",
    icon: <FiShoppingBag />,
    link: "/dashboard/orders",
  },
  {
    name: "Execution Panel",
    icon: <FiClipboard />,
    link: "/dashboard/execution-enquiries",
  },
  {
    name: "Approvals",
    icon: <FiCheckSquare />,
    link: "/dashboard/approvals",
  },
  {
    name: "Notifications",
    icon: <FiBell />,
    link: "/dashboard/notifications",
  },

  {
    name: "Profile", //Translate
    icon: <RiUser2Fill />,
    link: "/dashboard/profile",
  },
  // {
  //   name: "Map", //Translate
  //   icon: <LiaMapMarkedAltSolid />,
  //   link: "/dashboard/map",
  // },
  {
    name: "Geo Sphere", //Translate
    icon: <BsGlobeCentralSouthAsia />,
    link: "/dashboard/geosphere",
  },
  {
    name: "Users", //Translate
    icon: <FiUsers />,
    link: "/dashboard/users",
  },
  {
    name: "Essentials", //Translate
    icon: <MdOutlineSettingsInputComponent />,
    link: "/dashboard/essentials",
  },
  // {
  //   name: "RS Form", //Translate
  //   icon: <SiGoogleforms />,
  //   link: "/dashboard/rsForm",
  // },
];
