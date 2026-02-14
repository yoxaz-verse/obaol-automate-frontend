"use client";

import { TopbarProps } from "@/data/interface-data";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  User,
  Button
} from "@nextui-org/react";
import React, { useContext } from "react";
import { CiMenuBurger } from "react-icons/ci";
import { ThemeSwitcher } from "../ThemeSwitcher";

import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthContext from "@/context/AuthContext";
import { routeRoles } from "@/utils/roleHelpers";
import { sidebarOptions } from "@/utils/utils";
import Image from "next/image";

const TopBar = ({ username, role }: TopbarProps) => {
  const { logout } = useContext(AuthContext);
  const router = useRouter();

  // Filter options based on the user's role
  const filteredOptions = sidebarOptions.filter((option) => {
    const allowedRoles = routeRoles[option.link] || [];
    return allowedRoles.includes(role);
  });

  return (
    <div className="flex text-foreground justify-between items-center px-4 py-2 my-2 mx-2 md:px-6 md:py-4 md:my-4 md:mx-6 bg-content1 border border-default-200  rounded-2xl transition-all duration-300">
      {/* Left Section: Mobile Menu & Panel Identity */}
      <div className="flex gap-4 items-center">
        {/* Hamburger - Mobile only */}
        <div className="md:hidden">
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly variant="light" aria-label="Menu">
                <CiMenuBurger size={24} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Sidebar Options"
              disallowEmptySelection
              selectionMode="single"
              className="text-foreground"
            >
              {filteredOptions.map((option) => (
                <DropdownItem key={option.name}>
                  <Link href={option.link} className="w-full h-full block">
                    <div className="flex items-center gap-2">
                      <span className="text-warning-500"> {option.icon}</span>
                      {option.name}
                    </div>
                  </Link>
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>

        {/* Identity - Hidden on mobile, visible on desktop */}
        <div className="hidden md:flex flex-col">
          <h1 className="text-lg font-bold text-foreground">
            {role.charAt(0).toUpperCase() + role.slice(1)} Panel
          </h1>
          <p className="text-[10px] text-default-500">
            {new Date().getHours() < 12
              ? "Good Morning"
              : new Date().getHours() < 18
                ? "Good Afternoon"
                : "Good Evening"}
          </p>
        </div>
      </div>

      {/* Brand / Logo (Visible on mobile, replaces Identity) */}
      <div className="md:hidden">
        <Image
          src={"/logo.png"}
          width={80} // Smaller logo for mobile
          height={80}
          alt="Obaol"
          className="object-contain rounded-md"
        />
      </div>

      {/* Right Section: Theme Toggle & User Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        <ThemeSwitcher />

        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <User
              as="button"
              avatarProps={{
                isBordered: true,
                color: "warning",
                size: "sm",
                src: ""
              }}
              className="transition-transform"
              name={username}
              description={<span className="text-default-400 capitalize hidden md:block">{role}</span>} // Hide role on mobile
              classNames={{
                name: "text-foreground font-semibold hidden md:block", // Hide name on mobile
                description: "text-default-400"
              }}
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="User Actions" variant="flat" className="text-foreground">
            <DropdownItem key="profile" className="h-14 gap-2 ">
              <p className="font-semibold">Signed in as</p>
              <p className="font-semibold text-warning-500">{username}</p>
            </DropdownItem>
            <DropdownItem
              key="dashboard"
              onClick={() => router.push("/dashboard/profile")}
            >
              My Profile
            </DropdownItem>
            <DropdownItem
              key="logout"
              color="danger"
              onClick={async () => {
                await logout();
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
