"use client";

import { useContext, useState, useEffect } from "react";
import AuthContext from "@/context/AuthContext"; // Adjust the import path as necessary
import TopBar from "@/components/dashboard/TopBar";
import Sidebar from "@/components/dashboard/Sidebar";
import BottomNav from "@/components/dashboard/BottomNav";
import PrivateRoute from "@/components/Login/private-route";
import { usePathname, useRouter } from "next/navigation";
import { getAllowedRoles } from "@/utils/roleHelpers";
import BrandedLoader from "@/components/ui/BrandedLoader";
import { postData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { ACTION_ROUTES, loadShortcuts, ShortcutAction } from "@/utils/shortcutConfig";

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
  const router = useRouter();

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
  const { user, loading } = useContext(AuthContext);
  const roleLower = String(user?.role || "").toLowerCase();
  const isOperatorFamily = roleLower === "operator" || roleLower === "team";
  const isAssociate = roleLower === "associate";
  const profileComplete = Boolean(user?.name && user?.email && (user as any)?.phone);
  const hasAssociateCompany = Boolean(user?.associateCompanyId);
  const canBypassAssociateOnboarding = isAssociate && profileComplete && hasAssociateCompany;
  const registrationStatus = String(user?.registrationStatus || "").toUpperCase();
  const isRejected = ["associate", "operator", "team"].includes(roleLower)
    && registrationStatus === "REJECTED";
  const isOnboardingLocked =
    (isOperatorFamily && user?.onboardingComplete === false) ||
    (isAssociate && user?.onboardingComplete === false && !canBypassAssociateOnboarding);
  const isApprovalPending = ["associate", "operator", "team"].includes(roleLower)
    && !isRejected
    && user?.onboardingComplete === true
    && String(user?.registrationStatus || "APPROVED").toUpperCase() !== "APPROVED";

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

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    const isOnboardingRoute = pathname.startsWith("/dashboard/onboarding");
    const isPendingRoute = pathname.startsWith("/dashboard/pending-approval");
    if (isRejected && !pathname.startsWith("/dashboard/rejected")) {
      router.replace("/dashboard/rejected");
      return;
    }
    if (isOnboardingLocked && !isOnboardingRoute) {
      router.replace("/dashboard/onboarding");
      return;
    }
    if (isApprovalPending && !isPendingRoute) {
      router.replace("/dashboard/pending-approval");
      return;
    }
    if (!isApprovalPending && isPendingRoute) {
      router.replace("/dashboard?approval=approved");
      return;
    }
    if (!isOnboardingLocked && isOnboardingRoute) {
      router.replace("/dashboard");
    }
  }, [isOnboardingLocked, isApprovalPending, isRejected, loading, pathname, router, user]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (event: KeyboardEvent) => {
      const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform);
      const metaPressed = isMac ? event.metaKey : event.ctrlKey;
      if (!metaPressed) return;
      const key = String(event.key || "").toUpperCase();
      if (!key) return;

      const shortcuts = loadShortcuts();
      const entries = Object.entries(shortcuts) as [ShortcutAction, string][];
      const match = entries.find(([, value]) => String(value || "").toUpperCase() === key);
      if (!match) return;

      const [action] = match;
      const route = ACTION_ROUTES[action];
      if (!route) return;

      event.preventDefault();
      router.push(route);
    };

    window.addEventListener("keydown", handler, { capture: true });
    return () => window.removeEventListener("keydown", handler, { capture: true } as any);
  }, [router]);

  if (!isMounted) {
    return (
      <section className="bg-content1 min-h-screen">
        <BrandedLoader fullScreen message="ESTABLISHING COMMAND LINK" variant="compact" />
      </section>
    );
  }

  return (
    <section className="w-full min-w-0 h-full flex overflow-hidden bg-content1 relative lg:h-screen">
      <PrivateRoute allowedRoles={allowedRoles}>
        {!isOnboardingLocked && !isApprovalPending && (
          <Sidebar isCollapsed={isCollapsed} setIsCollapsed={toggleSidebar} isOnboardingLocked={isOnboardingLocked} />
        )}

        <div className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ease-in-out min-h-screen ${!isOnboardingLocked && !isApprovalPending ? (isCollapsed ? "md:ml-[84px]" : "md:ml-[280px]") : "md:ml-0"}`}>
          <div className="w-full lg:h-screen overflow-hidden flex flex-col relative">
            {/* Check if user data is available before rendering TopBar */}
            {user && !isApprovalPending && (
              <TopBar
                username={user.email} // Assuming user.email exists
                role={user.role} // Assuming user.role is a string
                isOnboardingLocked={isOnboardingLocked}
              />
            )}

            <div
              className="flex-1 w-full min-w-0 overflow-y-auto overflow-x-hidden px-1 md:px-0"
              style={{
                paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom))"
              }}
            >
              <div className="max-w-full mx-auto w-full p-2 md:p-6 min-w-0">
                {children}
              </div>
            </div>
          </div>
        </div>
        {!isApprovalPending && <BottomNav isOnboardingLocked={isOnboardingLocked} />}
      </PrivateRoute>
    </section>
  );
}
