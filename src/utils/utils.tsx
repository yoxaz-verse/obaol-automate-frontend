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
import { FiShoppingBag, FiPackage } from "react-icons/fi";
import { TbContainer } from "react-icons/tb";
import { BsBoxes } from "react-icons/bs";
import { FiClipboard } from "react-icons/fi";
import { FiCheckSquare } from "react-icons/fi";
import { FiBell } from "react-icons/fi";
import { FiFlag } from "react-icons/fi";
import { FiFileText } from "react-icons/fi";
import { FiGlobe } from "react-icons/fi";


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
  const commonOptions: any = {
    position: "top-right",
    className: "z-[9999]",
    style: {
      zIndex: 9999,
    },
  };

  if (type === "success") {
    toast.success(message, commonOptions);
  } else if (type === "error") {
    toast.error(message, commonOptions);
  } else if (type === "warning") {
    toast.warning(message, commonOptions);
  } else if (type === "info") {
    toast.info(message, commonOptions);
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
    name: "My Product", //Translate
    icon: <AiOutlineProduct />,
    link: "/dashboard/product",
  },
  {
    name: "Marketplace",
    icon: <FiShoppingBag />,
    link: "/dashboard/marketplace",
  },
  {
    name: "Imports",
    icon: <TbContainer />,
    link: "/dashboard/imports",
  },
  {
    name: "Catalog", //Translate
    icon: <GiBookAura />,
    link: "/dashboard/catalog",
  },
  {
    name: "Inventory",
    icon: <BsBoxes />,
    link: "/dashboard/inventory",
  },
  {
    name: "Warehouses",
    icon: <LuWarehouse />,
    link: "/dashboard/warehouses",
  },
  {
    name: "Rent Warehouse",
    icon: <TbContainer />,
    link: "/dashboard/warehouse-rent",
  },
  {
    name: "My Company",
    icon: <GoOrganization />,
    link: "/dashboard/company",
  },
  {
    name: "Companies", //Translate
    icon: <GoOrganization />,
    link: "/dashboard/companyProduct",
  },
  {
    name: "Hierarchy",
    icon: <MdOutlineAccountTree />,
    link: "/dashboard/operator/hierarchy",
  },
  {
    name: "Team",
    icon: <FiUsers />,
    link: "/dashboard/operator/team",
  },
  {
    name: "Earnings",
    icon: <MdOutlinePriceChange />,
    link: "/dashboard/operator/earnings",
  },
  {
    name: "Orders",
    icon: <FiShoppingBag />,
    link: "/dashboard/orders",
  },
  {
    name: "Documents",
    icon: <FiFileText />,
    link: "/dashboard/documents",
  },
  {
    name: "News",
    icon: <FiGlobe />,
    link: "/dashboard/news",
  },
  {
    name: "Documentation Rules",
    icon: <FiFileText />,
    link: "/dashboard/documentation-rules",
  },
  {
    name: "Documentation Preview",
    icon: <FiFileText />,
    link: "/dashboard/documentation-preview",
  },
  {
    name: "Flow Rules",
    icon: <FiFileText />,
    link: "/dashboard/flow-rules",
  },
  {
    name: "Order Rules",
    icon: <FiFileText />,
    link: "/dashboard/order-rules",
  },
  {
    name: "Enquiry Rules",
    icon: <FiFileText />,
    link: "/dashboard/enquiry-rules",
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
    name: "Reports",
    icon: <FiFlag />,
    link: "/dashboard/reports",
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
