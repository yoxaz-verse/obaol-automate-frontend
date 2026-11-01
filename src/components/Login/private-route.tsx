import AuthContext from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import BrandedLoader from "@/components/ui/BrandedLoader";
import { buildDashboardAccessInfoUrl, canAccessDashboardRoute } from "@/utils/dashboardAccess";
import { getDashboardRoute } from "@/utils/dashboardAccess";
import { useSidebarGovernance } from "@/hooks/useSidebarGovernance";
import { SIDEBAR_RECOVERY_ROUTES } from "@/utils/sidebarGovernance";

const PrivateRoute = ({
  children,
  pathname,
}: {
  children: React.ReactNode;
  pathname: string;
}) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);
  const router = useRouter();
  const governance = useSidebarGovernance();
  const route = getDashboardRoute(pathname);
  const governedPath = route?.activeParent || route?.breadcrumbParent || route?.path || pathname;
  const governedStatus = governance.isAssociate ? governance.getRouteStatus(governedPath) : "LIVE";
  const governancePending = governance.isAssociate && governance.isLoading;

  const roleAllowed = Boolean(user) && canAccessDashboardRoute({
    path: pathname,
    role: user?.role,
  });
  const isAllowed = roleAllowed && (!governance.isAssociate || SIDEBAR_RECOVERY_ROUTES.has(governedPath) || (governance.isSuccess && governedStatus === "LIVE"));
  useEffect(() => {
    if (!loading && !governancePending) {
      if (!isAuthenticated) {
        router.replace("/auth?view=signin");
      } else if (!roleAllowed) {
        router.replace(buildDashboardAccessInfoUrl(pathname, "role"));
      } else if (!isAllowed) {
        const reason = governedStatus === "COMING_SOON" ? "coming-soon" : "company-function";
        router.replace(buildDashboardAccessInfoUrl(pathname, reason));
      }
    }
  }, [isAuthenticated, loading, governancePending, roleAllowed, isAllowed, governedStatus, router]);

  if (loading || governancePending) {
    return <BrandedLoader fullScreen message="Loading your workspace" />;
  }

  if (!isAuthenticated || !isAllowed) {
    return <BrandedLoader fullScreen message="Redirecting" variant="compact" />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
