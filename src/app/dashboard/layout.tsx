"use client"
import Sidebar from "@/components/dashboard/Sidebar";
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <section >
            <div className="w-full flex flex-row h-screen">
            <div className="flex w-1/5 h-screen">
            <Sidebar/>
            </div>
            <div className="w-4/5">
            {children}
            </div>
            </div>
        </section>
    );
}
