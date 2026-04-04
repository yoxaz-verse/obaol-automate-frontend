import AuthContext from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import BrandedLoader from "@/components/ui/BrandedLoader";

const PrivateRoute = ({
  children,
  allowedRoles = [], // Specify roles that can access this route
}: {
  children: React.ReactNode;
  allowedRoles?: string[]; // Array of allowed roles
}) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);
  const router = useRouter();

  const normalizedAllowedRoles = allowedRoles.map((role) => String(role).toLowerCase());
  const userRole = String(user?.role || "").toLowerCase();
  const isAllowed = normalizedAllowedRoles.length === 0 || normalizedAllowedRoles.includes(userRole);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace("/auth"); // Redirect if not authenticated
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
