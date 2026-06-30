import AuthContext from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import BrandedLoader from "@/components/ui/BrandedLoader";
import { canAccessDashboardRoute } from "@/utils/dashboardAccess";

const PrivateRoute = ({
  children,
  pathname,
}: {
  children: React.ReactNode;
  pathname: string;
}) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);
  const router = useRouter();

  const isAllowed = Boolean(user) && canAccessDashboardRoute({
    path: pathname,
    role: user?.role,
    tradeMode: user?.tradeMode,
  });

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace("/auth?view=signin");
      } else if (!isAllowed) {
        router.replace("/403"); // Redirect to a "Forbidden" page if the role is unauthorized
      }
    }
  }, [isAuthenticated, loading, isAllowed, router]);

  if (loading) {
    return <BrandedLoader fullScreen message="Loading your workspace" />;
  }

  if (!isAuthenticated || !isAllowed) {
    return <BrandedLoader fullScreen message="Redirecting" variant="compact" />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
