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
            <div className="w-1/6 h-screen hidden lg:block">
                <Sidebar />
            </div>
            <div className="w-full md:w-4/5 lg:h-screen ">

                {children}


            </div>
        </section>
    );
}
