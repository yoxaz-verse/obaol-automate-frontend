"use client";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import { getData } from "@/core/api/apiHandler";
import { authRoutes } from "@/core/api/apiRoutes";
import { tabUtil } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentTab, setCurrentTab] = useState('Dashboard');
  function TabChange(tabName: string) {
    console.log(tabName);
    setCurrentTab(tabName);
  }

  const userData = useQuery({
    queryKey: ['userData'],
    queryFn: async () => {
      return await getData(authRoutes.checkUser, {})
    }
  })

  return (
    <section className="w-full h-full flex">
      <div className="w-1/6 h-screen hidden lg:block">
        <Sidebar />
      </div>
      <div className="w-full md:w-4/5 lg:h-screen ">
        <div>
          <TopBar username={
            userData.data?.data?.data?.user?.name
          }
            role={userData.data?.data?.data?.user?.Role?.roleName}
          />

          <div className="h-full w-full">
            {children}

          </div>

        </div>
      </div>
    </section>
  );
}
