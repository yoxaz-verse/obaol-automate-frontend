import { useMemo } from "react";
import { emailRegex } from "./regex";
import { ToastMessage } from "@/data/interface-data";
import { toast } from "react-toastify";
import { FiUsers } from "react-icons/fi";
import { RiFileAddLine, RiUser2Fill } from "react-icons/ri";
import { MdDashboard, MdOutlinePriceChange } from "react-icons/md";
import { AiOutlineProduct } from "react-icons/ai";
import { MdOutlineSettingsInputComponent } from "react-icons/md";
import { GiBookAura } from "react-icons/gi";
import { GiBeamsAura } from "react-icons/gi";
import { LiaMapMarkedAltSolid } from "react-icons/lia";
import { GoOrganization } from "react-icons/go";
import { GiShipWheel } from "react-icons/gi";
import { BsGlobeCentralSouthAsia } from "react-icons/bs";
import { SiGoogleforms } from "react-icons/si";
import { LuWarehouse } from "react-icons/lu";
import { FiShoppingBag } from "react-icons/fi";

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
    name: "Companies Product", //Translate
    icon: <GoOrganization />,
    link: "/dashboard/companyProduct",
  },
  {
    name: "Enquiries", //Translate
    icon: <RiFileAddLine />,
    link: "/dashboard/enquiries",
  },
  {
    name: "Orders",
    icon: <FiShoppingBag />,
    link: "/dashboard/orders",
  },
  {
    name: "Profile", //Translate
    icon: <RiUser2Fill />,
    link: "/dashboard/profile",
  },
  {
    name: "Map", //Translate
    icon: <LiaMapMarkedAltSolid />,
    link: "/dashboard/map",
  },
  {
    name: "Geo Sphere", //Translate
    icon: <BsGlobeCentralSouthAsia />,
    link: "/dashboard/geosphere",
  },
  {
    name: "Logistics", //Translate
    icon: <GiShipWheel />,
    link: "/dashboard/logistics",
  },
  {
    name: "RS Form", //Translate
    icon: <SiGoogleforms />,
    link: "/dashboard/rsForm",
  },
];
