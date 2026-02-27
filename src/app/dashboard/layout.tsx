"use client";

import { useContext, useState, useEffect } from "react";
import AuthContext from "@/context/AuthContext"; // Adjust the import path as necessary
import TopBar from "@/components/dashboard/TopBar";
import Sidebar from "@/components/dashboard/Sidebar";
import BottomNav from "@/components/dashboard/BottomNav";
import Template from "../template";
import PrivateRoute from "@/components/Login/private-route";
import { usePathname } from "next/navigation";
import { getAllowedRoles } from "@/utils/roleHelpers";

// export const routeRoles: { [key: string]: string[] } = {
//   "/dashboard": [
//     "Admin",
//     "Customer",
//     "ActivityManager",
//     "ProjectManager",
//     "Worker",
//   ],
//   "/dashboard/projects": [
//     "Admin",
//     "Customer",
//     "ActivityManager",
//     "ProjectManager",
//     "Worker",
//   ],
//   "/dashboard/essentials": ["Admin"],
//   "/dashboard/activity": [],
//   "/dashboard/users": ["Admin"],
// };
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  // Load state on mount
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState !== null) {
      setIsCollapsed(savedState === "true");
    }
    setIsMounted(true);
  }, []);

  // Sync state to localStorage
  const toggleSidebar = (value: boolean) => {
    setIsCollapsed(value);
    localStorage.setItem("sidebarCollapsed", String(value));
  };

  const allowedRoles = getAllowedRoles(pathname);
  const { user } = useContext(AuthContext);

  if (!isMounted) return <div className="bg-content1 min-h-screen" />;

  return (
    <section className="w-full h-full flex overflow-hidden bg-content1 relative">
      <PrivateRoute allowedRoles={allowedRoles}>
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={toggleSidebar} />

        <div className={`flex-1 flex flex-col transition-all duration-300 min-h-screen ${isCollapsed ? "md:ml-[80px]" : "md:ml-[280px]"}`}>
          <div className="w-full lg:h-screen overflow-hidden flex flex-col relative">
            {/* Check if user data is available before rendering TopBar */}
            {user && (
              <TopBar
                username={user.email} // Assuming user.email exists
                role={user.role} // Assuming user.role is a string
              />
            )}

            <div className="flex-1 w-full min-w-0 overflow-y-auto px-4 md:px-0 pb-20 md:pb-0">
              <div className="max-w-full mx-auto w-full p-4 md:p-6 min-w-0">
                <Template>
                  {children}
                </Template>
              </div>
              <div className="h-10" />
            </div>
          </div>
        </div>
        <BottomNav />
      </PrivateRoute>
    </section>
  );
}
