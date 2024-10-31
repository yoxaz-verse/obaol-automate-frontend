"use client";

import React, { useState, useEffect } from "react";
import {
  FiFileText,
  FiInbox,
  FiMessageCircle,
  FiSettings,
  FiUsers,
  FiTrendingUp,
} from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import { RiBuildingLine } from "react-icons/ri";
import { useRouter, usePathname } from "next/navigation";

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [selectedOption, setSelectedOption] = useState<string>("dashboard");

  useEffect(() => {
    // Extract the current section from the pathname
    // For example, '/dashboard/projects' -> 'projects'
    const pathSegments = pathname.split("/").filter(Boolean);
    let currentOption = "dashboard"; // Default option

    if (pathSegments[0] === "dashboard") {
      currentOption = pathSegments[1] || "dashboard";
    } else {
      currentOption = pathSegments[0];
    }

    setSelectedOption(currentOption.toLowerCase());
  }, [pathname]);

  const sidebarOptions = [
    {
      name: "Dashboard",
      icon: <MdDashboard />,
      link: "/dashboard",
    },
    {
      name: "Projects",
      icon: <RiBuildingLine />,
      link: "/dashboard/projects",
    },
    {
      name: "Activity",
      icon: <FiTrendingUp />,
      link: "/dashboard/activity",
    },
    {
      name: "Users",
      icon: <FiUsers />,
      link: "/dashboard/users",
    },
    {
      name: "Essentials",
      icon: <FiFileText />,
      link: "/dashboard/essentials",
    },
    {
      name: "Time Sheet",
      icon: <FiMessageCircle />,
      link: "/dashboard/timesheet",
    },
  ];

  const handleOptionClick = (optionLink: string, optionName: string) => {
    setSelectedOption(optionName.toLowerCase());
    router.push(optionLink);
  };

  return (
    <div className="flex fixed flex-col justify-between w-1/6 h-full">
      <div className="bg-white p-2 sm:p-4 rounded-lg shadow-lg justify-evenly h-full hidden md:block">
        <div className="flex py-[50px] justify-center items-center">LOGO</div>
        {sidebarOptions.map((option, index) => (
          <div
            key={index}
            onClick={() => handleOptionClick(option.link, option.name)}
            className={`p-4 cursor-pointer rounded font-medium ${
              selectedOption === option.name.toLowerCase()
                ? "bg-blue-200"
                : "text-[#8E8E93]"
            }`}
          >
            <div className="flex items-center gap-5 text-xs xl:text-base">
              <span
                className={`${
                  selectedOption === option.name.toLowerCase()
                    ? "text-blue-600"
                    : "text-[#8E8E93]"
                }`}
              >
                {option.icon}
              </span>
              <span
                className={`${
                  selectedOption === option.name.toLowerCase()
                    ? "text-blue-600"
                    : "text-black"
                }`}
              >
                {option.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
