import AuthContext from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import BrandedLoader from "@/components/ui/BrandedLoader";
import { canAccessDashboardRoute } from "@/utils/dashboardAccess";
import { getDashboardRoute } from "@/utils/dashboardAccess";
import { useSidebarGovernance } from "@/hooks/useSidebarGovernance";
import { getGovernedRouteStatus, SIDEBAR_RECOVERY_ROUTES } from "@/utils/sidebarGovernance";

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
  const governedStatus = governance.isAssociate ? getGovernedRouteStatus(governance.resolved, governedPath) : "LIVE";
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
        router.replace("/403");
      } else if (!isAllowed) {
        const reason = governedStatus === "COMING_SOON" ? "coming-soon" : "not-available";
        router.replace(`/dashboard?navigation=${reason}`);
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
