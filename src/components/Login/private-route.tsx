// src/components/PrivateRoute.tsx

"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthContext from "@/context/AuthContext";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    // Show a loading indicator while checking authentication
    return (
      <div className="flex h-screen justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // If not authenticated, do not render children (redirect will happen)
    return null;
  }

  // If authenticated, render the protected content
  return <>{children}</>;
};

export default PrivateRoute;
