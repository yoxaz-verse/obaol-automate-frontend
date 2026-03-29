// src/context/AuthContext.tsx

"use client";

import React, { createContext, useState, ReactNode, useEffect } from "react";
import { postData, getData } from "@/core/api/apiHandler";
import { useRouter } from "next/navigation";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  associateCompanyId?: string | null;
  companyInterestsConfigured?: boolean;
  companyInterests?: string[];
  verified: {
    email: boolean;
    phone?: boolean;
    gst?: boolean;
    // Add more verifications here as needed
  };
}

interface AuthContextProps extends AuthState {
  login: (data: LoginData) => Promise<void>;
  loginWithGoogle: (data: GoogleLoginData) => Promise<void>;
  logout: () => Promise<void>;
}

interface LoginData {
  email: string;
  password: string;
  role: string;
  rememberMe?: boolean;
}

interface GoogleLoginData {
  idToken: string;
  role: string;
  rememberMe?: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  user: null,
  loading: true, // Initial loading state
  login: async () => { },
  loginWithGoogle: async () => { },
  logout: async () => { },
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true, // Start with loading set to true
  });

  const router = useRouter();

  // Function to handle login
  const login = async (data: LoginData) => {
    try {
      const response = await postData("/login", data); // Unified login route

      if (response.data.success) {
        try {
          const userResponse = await getData("/verify-token");
          if (userResponse.data.success) {
            setAuth({
              isAuthenticated: true,
              user: userResponse.data.user,
              loading: false,
            });
            // Redirection handled in LoginComponent
          } else {
            throw new Error("Failed to retrieve user data");
          }
        } catch (verifyError: any) {
          const verifyStatus = Number(verifyError?.response?.status || 0);
          if (verifyStatus === 401) {
            const blockedError: any = new Error(
              "Session cookie was blocked by browser privacy settings. Allow cookies for obaol.com/api.obaol.com and retry."
            );
            blockedError.code = "SESSION_COOKIE_BLOCKED";
            throw blockedError;
          }
          throw verifyError;
        }
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setAuth((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const loginWithGoogle = async (data: GoogleLoginData) => {
    try {
      const response = await postData("/auth/google", {
        idToken: data.idToken,
        role: data.role,
        intent: "login",
        rememberMe: Boolean(data.rememberMe),
      });

      if (response.data.success) {
        try {
          const userResponse = await getData("/verify-token");
          if (userResponse.data.success) {
            setAuth({
              isAuthenticated: true,
              user: userResponse.data.user,
              loading: false,
            });
          } else {
            throw new Error("Failed to retrieve user data");
          }
        } catch (verifyError: any) {
          const verifyStatus = Number(verifyError?.response?.status || 0);
          if (verifyStatus === 401) {
            const blockedError: any = new Error(
              "Session cookie was blocked by browser privacy settings. Allow cookies for obaol.com/api.obaol.com and retry."
            );
            blockedError.code = "SESSION_COOKIE_BLOCKED";
            throw blockedError;
          }
          throw verifyError;
        }
      } else {
        throw new Error(response.data.message || "Google login failed");
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      setAuth((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  };

  // Function to handle logout
  const logout = async () => {
    try {
      try {
        await postData("/auth/logout", {});
      } catch (logoutError) {
        console.warn("Logout API call failed, continuing with local cleanup.", logoutError);
      }
      // Clear authentication state
      setAuth({
        isAuthenticated: false,
        user: null,
        loading: false,
      });

      // Remove the token from localStorage
      localStorage.removeItem("currentUserToken");
      sessionStorage.clear();

      // Redirect to the login page or another route
      router.replace("/auth");
      router.refresh();
      if (typeof window !== "undefined") {
        window.location.href = "/auth";
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Check authentication status on mount
  useEffect(() => {

    const checkAuth = async () => {
      try {
        const response = await getData("/verify-token");

        if (response && response.data.success) {
          setAuth({
            isAuthenticated: true,
            user: response.data.user,
            loading: false,
          });
        } else {
          setAuth({
            isAuthenticated: false,
            user: null,
            loading: false,
          });
          // Do not redirect here
        }
      } catch (error) {
        console.error("Auth check error:", error);
        {
          /* Translate */
        }

        setAuth({
          isAuthenticated: false,
          user: null,
          loading: false,
        });
        // Do not redirect here
      }
    };

    checkAuth();
  }, []); // Empty dependency array to run only once on mount

  return (
    <AuthContext.Provider value={{ ...auth, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
