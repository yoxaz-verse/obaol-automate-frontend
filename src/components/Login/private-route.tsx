import AuthContext from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import BrandedLoader from "@/components/ui/BrandedLoader";
import { canAccessDashboardRoute } from "@/utils/dashboardAccess";
import { hasWarehouseWorkspaceAccess, isWarehouseDashboardPath } from "@/utils/dashboardNav";
import { LuWarehouse } from "react-icons/lu";

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
  });
  const capabilities = [...(user?.providedCapabilities || []), ...(user?.soughtCapabilities || [])];
  const isWarehouseComingSoon = Boolean(user) &&
    isWarehouseDashboardPath(pathname) &&
    !hasWarehouseWorkspaceAccess(user?.role, capabilities);

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

  if (isWarehouseComingSoon) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center px-4 py-12" aria-labelledby="warehouse-coming-soon-title">
        <div className="w-full max-w-xl rounded-3xl border border-obaol-500/20 bg-content1 p-8 text-center shadow-sm md:p-12">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-obaol-500/10 text-obaol-600 dark:text-obaol-300">
            <LuWarehouse size={30} aria-hidden="true" />
          </div>
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.25em] text-obaol-600 dark:text-obaol-300">Coming soon</p>
          <h1 id="warehouse-coming-soon-title" className="text-2xl font-black tracking-tight text-foreground">Warehouse workspace</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-default-500">
            Warehouse tools are being prepared for your company. They become available when warehouse storage is selected in your company capabilities.
          </p>
        </div>
      </section>
    );
  }

  return <>{children}</>;
};

export default PrivateRoute;
