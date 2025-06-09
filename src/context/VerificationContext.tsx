"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
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

  const [verifiedInitialized, setVerifiedInitialized] = useState(false);


const updateVerificationStatus = useCallback(
  (type: VerificationTypes, value: boolean) => {
    setVerified((prev) => ({
      ...prev,
      [type]: value,
    }));
  },
  []
);


  const checkIfAlreadyVerified = useCallback(async () => {
    if (!user) return;

    try {
      const res = await postData(`/verification/status`, {
        method: "email",
      });

      if (res?.data?.verified) {
        updateVerificationStatus("email", true);
        if (pathname === "/verification") {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      // silent fail
    } finally {
      setVerifiedInitialized(true);
    }
  }, [user, updateVerificationStatus, pathname, router]);

  useEffect(() => {
    if (user) {
      checkIfAlreadyVerified();
    }
  }, [user, checkIfAlreadyVerified]);

  useEffect(() => {
    const checks = async () => {
      const verificationRules: { [key: string]: VerificationTypes[] } = {
        "/dashboard": [],
        "/dashboard/settings": ["email", "phone", "gst"],
        "/dashboard/profile": [],
      };
      const required = verificationRules[pathname] || [];

      const passed: { [key in VerificationTypes]?: boolean } = {};
      for (const type of required) {
        switch (type) {
          case "email":
            passed.email = user?.verified?.email ?? false;
            break;
          case "phone":
            passed.phone = user?.verified?.phone ?? false;
            break;
          case "gst":
            passed.gst = user?.verified?.gst ?? false;
            break;
        }
      }

      setVerified((prev) => {
        const updated = { ...prev, ...passed };
        // Avoid unnecessary re-renders
        if (JSON.stringify(updated) !== JSON.stringify(prev)) {
          return updated;
        }
        return prev;
      });

      const failed = required.find((v) => !passed[v]);
      if (failed) {
        router.push("/verification-pending");
      }
    };

    if (user && verifiedInitialized) {
      checks();
    }
  }, [pathname, router, user, verifiedInitialized]);

  return (
    <VerificationContext.Provider
      value={{ verified, updateVerificationStatus }}
    >
      {children}
    </VerificationContext.Provider>
  );
};

export const useVerification = () => useContext(VerificationContext);
