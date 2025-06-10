"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import AuthContext from "./AuthContext";
import { postData } from "@/core/api/apiHandler";

type VerificationTypes = "email" | "phone" | "gst";

interface VerificationContextType {
  verified: { [key in VerificationTypes]?: boolean };
  updateVerificationStatus: (type: VerificationTypes, value: boolean) => void;
}

const VerificationContext = createContext<VerificationContextType>({
  verified: {},
  updateVerificationStatus: () => {},
});

export const VerificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();

  const [verified, setVerified] = useState<{
    [key in VerificationTypes]?: boolean;
  }>({});
  const [initialized, setInitialized] = useState(false);

  const updateVerificationStatus = useCallback(
    (type: VerificationTypes, value: boolean) => {
      setVerified((prev) => {
        if (prev[type] === value) return prev;
        return { ...prev, [type]: value };
      });
    },
    []
  );

  // Prevent repeat router.push
  const hasRedirected = useRef(false);

  const fetchInitialStatus = useCallback(async () => {
    if (!user) return;

    try {
      const res = await postData(`/verification/status`, { method: "email" });

      if (res?.data?.verified) {
        updateVerificationStatus("email", true);
        if (pathname === "/verification") {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      // Optional: console.warn("Verification fetch error", err);
    } finally {
      setInitialized(true);
    }
  }, [user, pathname, router, updateVerificationStatus]);

  useEffect(() => {
    if (user && !initialized) {
      fetchInitialStatus();
    }
  }, [user, initialized, fetchInitialStatus]);

  useEffect(() => {
    if (!user || !initialized || hasRedirected.current) return;

    const verificationRules: Record<string, VerificationTypes[]> = {
      "/dashboard": ["email"],
      "/dashboard/settings": ["email", "phone", "gst"],
      "/dashboard/profile": [],
    };

    const getVerificationTypes = (path: string): VerificationTypes[] => {
      const matched = Object.keys(verificationRules)
        .filter((rulePath) => path.startsWith(rulePath))
        .sort((a, b) => b.length - a.length); // prioritize deeper match
      return matched.length > 0 ? verificationRules[matched[0]] : [];
    };

    const requiredVerifications = getVerificationTypes(pathname);

    const notVerified = requiredVerifications.find(
      (type) => !(user?.verified?.[type] || verified[type])
    );

    if (notVerified) {
      hasRedirected.current = true;
      router.push("/verification-pending");
    } else {
      const updates: Partial<typeof verified> = {};
      requiredVerifications.forEach((type) => {
        if (!verified[type] && user?.verified?.[type]) {
          updates[type] = true;
        }
      });

      if (Object.keys(updates).length > 0) {
        setVerified((prev) => ({ ...prev, ...updates }));
      }
    }
  }, [user, pathname, verified, initialized, router]);

  return (
    <VerificationContext.Provider
      value={{ verified, updateVerificationStatus }}
    >
      {children}
    </VerificationContext.Provider>
  );
};

export const useVerification = () => useContext(VerificationContext);
