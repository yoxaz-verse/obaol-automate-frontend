import { TopbarProps } from "@/data/interface-data";
import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  User,
} from "@nextui-org/react";
import React, { useState } from "react";
import { CiMenuBurger } from "react-icons/ci";
import {
  FiFileText,
  FiInbox,
  FiMessageCircle,
  FiSettings,
  FiUsers,
} from "react-icons/fi";
import { GrNotification, GrSearch, GrUserManager } from "react-icons/gr";
import { MdDashboard } from "react-icons/md";
import { RiAdminFill, RiBuildingLine } from "react-icons/ri";
import UnderDevelopment from "../hashed/under-development";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { link } from "fs";

const TopBar = ({ username, role }: TopbarProps) => {
  const [selectedOption, setSelectedOption] = useState("");
  const router = useRouter();
  const [isSuperAdmin, setIsSuperAdmin] = useState(true);
  const sidebarOptions = [
    {
      name: "Dashboard",
      icon: <MdDashboard />,
      color: selectedOption === "Dashboard" ? "text-blue-600" : "",
      link: "/dashboard",
    },
    {
      name: "Projects",
      icon: <FiFileText />,
      color: selectedOption === "Projects" ? "text-blue-600" : "",
      link: "/dashboard/projects",
    },
    {
      name: "Activity",
      icon: <FiInbox />,
      color: selectedOption === "Activity" ? "text-blue-600" : "",
      link: "/dashboard/activity",
    },
    {
      name: "Essentials",
      icon: <RiBuildingLine />,
      color: selectedOption === "Analytics" ? "text-blue-600" : "",
      link: "/dashboard/essentials",
    },
    // {
    //   name: "Workers",
    //   icon: <FiMessageCircle />,
    //   color: selectedOption === "Workers" ? "text-blue-600" : "",
    //   link: "/dashboard/users",
    // },
    {
      name: "Time sheet",
      icon: <FiFileText />,
      color: selectedOption === "Customers" ? "text-blue-600" : "",
      link: "/dashboard/timesheet",
    },
    // {
    //   name: "Manager",
    //   icon: <GrUserManager />,
    //   color: selectedOption === "Manager" ? "text-blue-600" : "",
    //   link: "/dashboard/users",
    // },
    // {
    //   name: "Services",
    //   icon: <RiBuildingLine />,
    //   color: selectedOption === "Services" ? "text-blue-600" : "",
    //   link: "/dashboard/users",
    // },
    {
      name: "Users",
      icon: <RiAdminFill />,
      color: selectedOption === "Admins" ? "text-blue-600" : "",
      link: "/dashboard/users",
    },
  ].filter((option) => option !== null);
  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    console.log(option);
  };
  return (
    <div className="flex justify-between p-5">
      <Dropdown className="items-center justify-center h-full flex xl:hidden">
        <DropdownTrigger>
          <div className="w-4 h-4 p-3  border-slate-300 md:hidden">
            <CiMenuBurger />
          </div>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Static Actions"
          disallowEmptySelection
          selectionMode="single"
          selectedKeys={selectedOption}
        >
          {sidebarOptions.map((option, index) => (
            <DropdownItem
              key={option?.name}
              className={`${
                selectedOption === option?.name && "bg-[#e7f1fe] font-bold"
              }`}
            >
              <Link
                href={option.link}
                key="new"
                className={`${
                  option?.name === "Logout" && option?.color
                } flex flex-row w-full items-center`}
                onClick={() =>
                  handleOptionClick(option?.name ? option.name : "Dashboard")
                }
              >
                <div className={`mr-2 ${option?.color}`}>{option?.icon}</div>
                <div>{option?.name}</div>
              </Link>
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
      <div className="p-5 hidden md:block">
        <div className="text-sm md:text-xl font-medium ">{role} Panel</div>
        <div className="text-xs sm:text-md ">
          {new Date().getHours() < 12
            ? "Good Morning"
            : new Date().getHours() < 18
            ? "Good Afternoon"
            : "Good Evening"}
        </div>
      </div>
      <div className="flex items-center justify-center gap-5 ">
        {/* <Input
          type="text"
          label="Search"
          color="primary"
          className="lg:w-[500px] h-10  b "
          // color="primary"
          endContent={
            <UnderDevelopment>
              <GrSearch className="text-xl text-default-400 pointer-events-none flex-shrink-0" />
            </UnderDevelopment>
          }
        /> */}
        <UnderDevelopment>
          <Dropdown placement="bottom-start">
            <DropdownTrigger>
              <div className="h-6 flex items-center justify-center px-1">
                <GrNotification className="text-xl" />
              </div>
            </DropdownTrigger>
            <DropdownMenu aria-label="User Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-bold">Signed in as</p>
                <p className="font-bold">{username}</p>
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                onClick={() => {
                  localStorage.removeItem("currentUserToken");
                  router.push("/auth");
                }}
              >
                Log Out
              </DropdownItem>
            </DropdownMenu>{" "}
          </Dropdown>
        </UnderDevelopment>
        <Dropdown placement="bottom-start">
          <DropdownTrigger>
            <User
              as="button"
              avatarProps={{
                isBordered: true,
              }}
              className="transition-transform"
              description={role}
              name={username}
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="User Actions" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-bold">Signed in as</p>
              <p className="font-bold">{username}</p>
            </DropdownItem>
            <DropdownItem
              key="logout"
              color="danger"
              onClick={() => {
                localStorage.removeItem("currentUserToken");
                router.push("/auth");
              }}
            >
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
};

export default TopBar;
