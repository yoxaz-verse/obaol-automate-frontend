import { useMemo } from "react";
import { emailRegex } from "./regex";
import { ToastMessage } from "@/data/interface-data";
import { toast } from "react-toastify";
import { FiUsers } from "react-icons/fi";
import { RiFileAddLine } from "react-icons/ri";
import { MdDashboard, MdOutlinePriceChange, MdOutlineAccountTree } from "react-icons/md";
import { AiOutlineProduct } from "react-icons/ai";
import { MdOutlineSettingsInputComponent } from "react-icons/md";
import { GiBookAura } from "react-icons/gi";

import { LiaMapMarkedAltSolid } from "react-icons/lia";
import { GoOrganization } from "react-icons/go";
import { BsGlobeCentralSouthAsia } from "react-icons/bs";
import { SiGoogleforms } from "react-icons/si";
import {
  LuBusFront,
  LuChartNoAxesCombined,
  LuCircleHelp,
  LuClipboardCheck,
  LuContact,
  LuContainer,
  LuCreditCard,
  LuIdCard,
  LuListChecks,
  LuListPlus,
  LuMap,
  LuMicroscope,
  LuNotebookTabs,
  LuPackageCheck,
  LuPackageOpen,
  LuPanelLeft,
  LuPanelsTopLeft,
  LuPanelTopOpen,
  LuRoute,
  LuScanLine,
  LuScrollText,
  LuSettings2,
  LuShare2,
  LuShip,
  LuStamp,
  LuUserCog,
  LuUsersRound,
  LuWarehouse,
  LuWorkflow,
} from "react-icons/lu";
import { FiShoppingBag, FiPackage } from "react-icons/fi";
import { TbBuildingWarehouse, TbArrowsUpDown } from "react-icons/tb";
import { BsBoxes } from "react-icons/bs";
import { FiClipboard } from "react-icons/fi";
import { FiCheckSquare } from "react-icons/fi";
import { FiBell, FiFlag, FiFileText, FiLayers, FiEye, FiActivity, FiSearch, FiEdit3, FiBookOpen, FiSliders, FiSettings, FiHeadphones } from "react-icons/fi";
import { LuBox, LuTruck, LuWallet, LuBuilding2, LuStore, LuPackage, LuFlaskConical } from "react-icons/lu";
import { RiAuctionLine } from "react-icons/ri";


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
    name: "Buyer Requests",
    icon: <RiAuctionLine />,
    link: "/dashboard/bidding",
  },
  {
    name: "Buying Requests",
    icon: <LuListChecks />,
    link: "/dashboard/bidding/my",
  },
  {
    name: "Sample Requests",
    icon: <LuBox />,
    link: "/dashboard/sample-requests",
  },
  {
    name: "My Listings", //Translate
    icon: <AiOutlineProduct />,
    link: "/dashboard/product",
  },
  {
    name: "Browse Listings",
    icon: <LuStore />,
    link: "/dashboard/marketplace",
  },
  {
    name: "Rate Interest",
    icon: <FiActivity />,
    link: "/dashboard/rate-interest",
  },
  {
    name: "Import Opportunities",
    icon: <LuShip />,
    link: "/dashboard/imports",
  },
  { name: "My Import Listings", icon: <LuListPlus />, link: "/dashboard/imports/my-listings" },
  { name: "Import Reservations", icon: <FiClipboard />, link: "/dashboard/imports/reservations" },
  {
    name: "Commodity Catalog", //Translate
    icon: <GiBookAura />,
    link: "/dashboard/catalog",
  },
  {
    name: "Inventory",
    icon: <BsBoxes />,
    link: "/dashboard/inventory",
  },
  {
    name: "My Warehouses",
    icon: <LuWarehouse />,
    link: "/dashboard/warehouses",
  },
  { name: "Warehouse Operations", icon: <TbArrowsUpDown />, link: "/dashboard/warehouses/operations" },
  {
    name: "Warehouse Directory",
    icon: <TbBuildingWarehouse />,
    link: "/dashboard/warehouse-rent",
  },
  {
    name: "Quality Labs",
    icon: <LuFlaskConical />,
    link: "/dashboard/quality-labs",
  },
  { name: "My Lab", icon: <LuMicroscope />, link: "/dashboard/quality-labs/my" },
  { name: "Lab Execution", icon: <LuClipboardCheck />, link: "/dashboard/quality-labs/execution" },
  { name: "Packaging Services", icon: <FiPackage />, link: "/dashboard/packaging" },
  { name: "My Packaging", icon: <LuPackageOpen />, link: "/dashboard/packaging/my" },
  { name: "Packaging Execution", icon: <LuScanLine />, link: "/dashboard/packaging/execution" },
  { name: "Freight Forwarding", icon: <LuContainer />, link: "/dashboard/freight-forwarding" },
  { name: "My Freight Profile", icon: <LuContact />, link: "/dashboard/freight-forwarding/my" },
  { name: "Freight Associates", icon: <FiUsers />, link: "/dashboard/freight-forwarding/associates" },
  { name: "Freight Shipments", icon: <LuTruck />, link: "/dashboard/freight-forwarding/shipments" },
  { name: "Freight Customs", icon: <LuStamp />, link: "/dashboard/freight-forwarding/customs" },
  { name: "Freight Finance", icon: <LuWallet />, link: "/dashboard/freight-forwarding/finance" },
  { name: "Transport Overview", icon: <LuMap />, link: "/dashboard/inland-transportation" },
  { name: "Transport Opportunities", icon: <LuRoute />, link: "/dashboard/inland-transportation/opportunities" },
  { name: "Transport Trips", icon: <LiaMapMarkedAltSolid />, link: "/dashboard/inland-transportation/trips" },
  { name: "Fleet & Drivers", icon: <LuBusFront />, link: "/dashboard/inland-transportation/fleet" },
  { name: "Transport Documents", icon: <FiFileText />, link: "/dashboard/inland-transportation/documents" },
  { name: "Transport Profile", icon: <LuIdCard />, link: "/dashboard/inland-transportation/profile" },
  {
    name: "My Company",
    icon: <GoOrganization />,
    link: "/dashboard/company",
  },
  {
    name: "Referrals & Earnings",
    icon: <LuShare2 />,
    link: "/dashboard/referrals",
  },
  {
    name: "Company",
    icon: <LuBuilding2 />,
    link: "/dashboard/companies",
  },
  {
    name: "Hierarchy",
    icon: <MdOutlineAccountTree />,
    link: "/dashboard/operator/hierarchy",
  },
  {
    name: "Team",
    icon: <LuUsersRound />,
    link: "/dashboard/operator/team",
  },
  {
    name: "Earnings",
    icon: <MdOutlinePriceChange />,
    link: "/dashboard/operator/earnings",
  },
  {
    name: "Internal Orders",
    icon: <LuPackage />,
    link: "/dashboard/orders",
  },
  {
    name: "External Orders",
    icon: <LuPackageCheck />,
    link: "/dashboard/external-orders",
  },
  {
    name: "Documentation",
    icon: <LuNotebookTabs />,
    link: "/dashboard/documentation",
  },
  {
    name: "Documentation Rules",
    icon: <MdOutlineSettingsInputComponent />,
    link: "/dashboard/documentation-rules",
  },
  {
    name: "Template Studio",
    icon: <FiLayers />,
    link: "/dashboard/documentation-template-studio",
  },
  {
    name: "Payment Rules",
    icon: <LuCreditCard />,
    link: "/dashboard/payments",
  },
  {
    name: "Calculations",
    icon: <FiSliders />,
    link: "/dashboard/calculations",
  },
  {
    name: "Email Templates",
    icon: <FiEdit3 />,
    link: "/dashboard/email-templates",
  },
  {
    name: "Real-Life Scenarios",
    icon: <FiBookOpen />,
    link: "/dashboard/real-life-scenarios",
  },
  {
    name: "Flow Rules",
    icon: <LuWorkflow />,
    link: "/dashboard/flow-rules",
  },
  {
    name: "Order Rules",
    icon: <LuScrollText />,
    link: "/dashboard/order-rules",
  },
  {
    name: "Operator Overview",
    icon: <LuChartNoAxesCombined />,
    link: "/dashboard/operators/overview",
  },
  {
    name: "Enquiry Rules",
    icon: <FiSearch />,
    link: "/dashboard/enquiry-rules",
  },
  {
    name: "Execution Panel",
    icon: <LuPanelTopOpen />,
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
    name: "Guidance",
    icon: <LuCircleHelp />,
    link: "/dashboard/guidance",
  },

  {
    name: "Settings",
    icon: <FiSettings />,
    link: "/dashboard/settings",
  },
  {
    name: "Customer Support",
    icon: <FiHeadphones />,
    link: "/dashboard/customer-support",
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
    icon: <LuUserCog />,
    link: "/dashboard/users",
  },
  {
    name: "Function Preview",
    icon: <LuPanelsTopLeft />,
    link: "/dashboard/function-preview",
  },
  {
    name: "Sidebar Governance",
    icon: <LuPanelLeft />,
    link: "/dashboard/sidebar-governance",
  },
  {
    name: "Essentials", //Translate
    icon: <LuSettings2 />,
    link: "/dashboard/essentials",
  },
  // {
  //   name: "RS Form", //Translate
  //   icon: <SiGoogleforms />,
  //   link: "/dashboard/rsForm",
  // },
];
