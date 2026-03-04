// src/components/RoleRoute.tsx

'use client';

import React, { useContext, useEffect } from 'react';
import AuthContext from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import BrandedLoader from "@/components/ui/BrandedLoader";

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated && user && !allowedRoles.includes(user.role)) {
      // Redirect to unauthorized page or dashboard
      router.replace('/unauthorized');
    } else if (!isAuthenticated) {
      router.replace('/auth');
    }
  }, [isAuthenticated, user, allowedRoles, router, loading]);

  if (loading) {
    return <BrandedLoader fullScreen message="Checking access" variant="compact" />;
  }

  if (!isAuthenticated || (user && !allowedRoles.includes(user.role))) {
    return <BrandedLoader fullScreen message="Redirecting" variant="compact" />;
  }

  return <>{children}</>;
};

export default RoleRoute;
