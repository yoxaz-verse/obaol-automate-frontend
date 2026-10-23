"use client";

import { useEffect, useState } from "react";
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
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "/api/v1/web";
        const backendOrigin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN?.replace(/\/+$/, "") || "";
        const baseUrl = /^https?:\/\//i.test(apiBase)
          ? apiBase
          : backendOrigin
            ? `${backendOrigin}${apiBase.startsWith("/") ? apiBase : `/${apiBase}`}`
            : apiBase;
        const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/verify-token`, {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error("No active session");
        if (cancelled) return;
        const body = await response.json();
        const payload = body?.data ?? body;
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
