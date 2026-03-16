"use client";

import { useContext, useState, useEffect } from "react";
import AuthContext from "@/context/AuthContext"; // Adjust the import path as necessary
import TopBar from "@/components/dashboard/TopBar";
import Sidebar from "@/components/dashboard/Sidebar";
import BottomNav from "@/components/dashboard/BottomNav";
import PrivateRoute from "@/components/Login/private-route";
import { usePathname } from "next/navigation";
import { getAllowedRoles } from "@/utils/roleHelpers";
import BrandedLoader from "@/components/ui/BrandedLoader";
import { postData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";

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

  useEffect(() => {
    if (!user?.id) return;

    let timer: ReturnType<typeof setInterval> | null = null;
    let mounted = true;

    const pingPresence = async () => {
      if (!mounted || document.visibilityState !== "visible") return;
      try {
        await postData(apiRoutes.presence.ping, {});
      } catch {
        // Presence ping is best effort; ignore transient failures.
      }
    };

    void pingPresence();
    timer = setInterval(() => {
      void pingPresence();
    }, 60 * 1000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void pingPresence();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [user?.id]);

  if (!isMounted) {
    return (
      <section className="bg-content1 min-h-screen">
        <BrandedLoader fullScreen message="Preparing dashboard" variant="compact" />
      </section>
    );
  }

  return (
    <section className="w-full min-w-0 h-full flex overflow-hidden bg-content1 relative lg:h-screen">
      <PrivateRoute allowedRoles={allowedRoles}>
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={toggleSidebar} />

        <div className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ease-in-out min-h-screen ${isCollapsed ? "md:ml-[72px]" : "md:ml-[240px]"}`}>
          <div className="w-full lg:h-screen overflow-hidden flex flex-col relative">
            {/* Check if user data is available before rendering TopBar */}
            {user && (
              <TopBar
                username={user.email} // Assuming user.email exists
                role={user.role} // Assuming user.role is a string
              />
            )}

            <div
              className="flex-1 w-full min-w-0 overflow-y-auto overflow-x-hidden px-4 md:px-0"
              style={{
                paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom))"
              }}
            >
              <div className="max-w-full mx-auto w-full p-4 md:p-6 min-w-0">
                {children}
              </div>
            </div>
          </div>
        </div>
        <BottomNav />
      </PrivateRoute>
    </section>
  );
}
