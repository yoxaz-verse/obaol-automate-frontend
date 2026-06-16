// src/app/not-found.tsx or src/pages/404.tsx (depending on your Next.js version)

"use client"; // Enables the component to use React hooks and client-side features

import { useEffect } from "react";
import { useRouter } from "next/navigation"; // For Next.js 13+
import BrandedLoader from "@/components/ui/BrandedLoader";
import { usePublicAuthStatus } from "@/hooks/usePublicAuthStatus";

const NotFound = () => {
  const { isAuthenticated, loading } = usePublicAuthStatus(); // Access authentication state
  const router = useRouter(); // Initialize the router

  useEffect(() => {
    if (!loading) {
      // Ensure that authentication status is determined
      if (isAuthenticated) {
        router.push("/dashboard"); // Redirect authenticated users to the dashboard
      } else {
        router.push("/auth"); // Redirect unauthenticated users to the auth page
      }
    }
  }, [isAuthenticated, loading, router]); // Dependencies for useEffect

  if (loading) {
    // While authentication status is being determined, show a loading indicator
    return <BrandedLoader fullScreen message="Loading destination" />;
  }

  // Optionally, return null since redirection will occur
  return null;
};

export default NotFound;
