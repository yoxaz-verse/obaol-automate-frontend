"use client";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import { tabUtil } from "@/utils/utils";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [currentTab, setCurrentTab] = useState('Dashboard');
    const searchParams = useSearchParams()
  const search = searchParams.get('role')
    function TabChange(tabName: string) {
        setCurrentTab(tabName);
    }

    return (
        <section className="w-full h-full flex">
            <div className="w-1/5 h-screen hidden lg:block">
                <Sidebar tabChange={TabChange} />
            </div>
            <div className="w-full md:w-4/5 lg:h-screen overflow-auto">
            <TopBar username={search?search:'user'} TabChange={TabChange}/>

                <div className="h-full w-full">
                    {children}
                    {tabUtil(currentTab,search?search:'superadmin')}
                </div>
            </div>
        </section>
    );
}
