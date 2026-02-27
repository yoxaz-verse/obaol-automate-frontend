"use client";

import { TopbarProps } from "@/data/interface-data";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  User,
  Button,
  Divider
} from "@heroui/react";
import React, { useContext } from "react";
import { CiMenuBurger } from "react-icons/ci";
import { ThemeSwitcher } from "../ThemeSwitcher";
import { LanguageSwitcher } from "./LanguageSwitcher";

import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthContext from "@/context/AuthContext";
import { routeRoles } from "@/utils/roleHelpers";
import { sidebarOptions } from "@/utils/utils";
import Image from "next/image";
import CurrencySelector from "./Catalog/currency-selector";
import { FiSettings } from "react-icons/fi";

const TopBar = ({ username, role }: TopbarProps) => {
  const { logout } = useContext(AuthContext);
  const router = useRouter();

  // Filter options based on the user's role
  const filteredOptions = sidebarOptions.filter((option) => {
    const allowedRoles = routeRoles[option.link] || [];
    return allowedRoles.includes(role);
  });

  return (
    <div className="flex text-foreground justify-between items-center px-4 py-2 my-2 mx-2 md:px-6 md:py-4 md:my-4 md:mx-6 rounded-2xl border border-default-200/70 bg-gradient-to-r from-content1/95 via-content1/80 to-content1/95 backdrop-blur-xl shadow-[0_10px_30px_-18px_rgba(0,0,0,0.45)] transition-all duration-300">
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
              {...({
                "aria-label": "Sidebar Options",
                disallowEmptySelection: true,
                selectionMode: "single",
                className: "text-foreground",
              } as any)}
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

      {/* Right Section: Utilities & User Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        <CurrencySelector />

        <Dropdown {...({ placement: "bottom-end" } as any)}>
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
          <DropdownMenu
            {...({
              "aria-label": "User Actions",
              variant: "flat",
              className: "text-foreground min-w-[290px]",
              itemClasses: { base: "rounded-lg data-[hover=true]:bg-default-100" },
            } as any)}
          >
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
            <DropdownItem key="prefs-header" isReadOnly textValue="Preferences">
              <div className="flex items-center gap-2 text-default-500 text-xs font-semibold uppercase tracking-wide">
                <FiSettings size={13} />
                Preferences
              </div>
            </DropdownItem>
            <DropdownItem key="prefs-divider" isReadOnly className="p-0 h-auto" textValue="Divider">
              <Divider />
            </DropdownItem>
            <DropdownItem key="language-control" closeOnSelect={false} textValue="Language control">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-default-600">Language</span>
                <LanguageSwitcher />
              </div>
            </DropdownItem>
            <DropdownItem key="theme-control" closeOnSelect={false} textValue="Theme control">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-default-600">Theme</span>
                <ThemeSwitcher />
              </div>
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
