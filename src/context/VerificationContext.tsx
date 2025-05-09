"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
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

  const [verifiedInitialized, setVerifiedInitialized] = useState(false); // 🔥 Fix

  const verificationRules: { [key: string]: VerificationTypes[] } = {
    "/dashboard": [],
    "/dashboard/settings": ["email", "phone", "gst"],
    "/dashboard/profile": [],
  };

  const updateVerificationStatus = (
    type: VerificationTypes,
    value: boolean
  ) => {
    setVerified((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  // 🧠 Central check for auto-verification (like email already verified)
  const checkIfAlreadyVerified = async () => {
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
      // Silent fail – user will go through manual verification
    } finally {
      setVerifiedInitialized(true); // ✅ Mark init done
    }
  };

  useEffect(() => {
    if (user) checkIfAlreadyVerified();
  }, [user]);

  useEffect(() => {
    const checks = async () => {
      const required = verificationRules[pathname] || [];

      let passed: { [key in VerificationTypes]?: boolean } = {};
      for (const type of required) {
        switch (type) {
          case "email":
            passed.email = user?.verified?.email ?? verified.email ?? false;
            break;
          case "phone":
            passed.phone = user?.verified?.phone ?? verified.phone ?? false;
            break;
          case "gst":
            passed.gst = user?.verified?.gst ?? verified.gst ?? false;
            break;
        }
      }

      setVerified((prev) => ({ ...prev, ...passed }));

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
