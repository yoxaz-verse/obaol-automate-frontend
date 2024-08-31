"use client";
import TopBar from "@/components/dashboard/TopBar";
import Dashboard from "@/components/dashboard/dashboard";
import { getData } from "@/core/api/apiHandler";
import { authRoutes } from "@/core/api/apiRoutes";
import { tabUtil } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import React from "react";

function Page() {
  const userData = useQuery({
    queryKey: ["userData"],
    queryFn: async () => {
      return await getData(authRoutes.checkUser, {});
    },
  });
  console.log(userData.data?.data?.data?.user?.Role?.roleName);

  return (
    <>
      <Dashboard />
    </>
  );
}

export default Page;
