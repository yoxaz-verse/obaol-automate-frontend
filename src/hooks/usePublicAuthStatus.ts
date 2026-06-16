"use client";

import { useEffect, useState } from "react";
import { getData } from "@/core/api/apiHandler";
import type { User } from "@/context/AuthContext";

type PublicAuthStatus = {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
};

export function usePublicAuthStatus(): PublicAuthStatus {
  const [status, setStatus] = useState<PublicAuthStatus>({
    isAuthenticated: false,
    loading: true,
    user: null,
  });

  useEffect(() => {
    let cancelled = false;

    const loadSession = async () => {
      try {
        const response = await getData("/verify-token");
        if (cancelled) return;
        const payload = response?.data;
        const user = payload?.success && payload?.user ? payload.user : null;
        setStatus({
          isAuthenticated: Boolean(user),
          loading: false,
          user,
        });
      } catch {
        if (!cancelled) {
          setStatus({
            isAuthenticated: false,
            loading: false,
            user: null,
          });
        }
      }
    };

    void loadSession();
    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
