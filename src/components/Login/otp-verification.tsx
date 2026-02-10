"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, InputOtp } from "@heroui/react";
import { User } from "@/context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { postData } from "@/core/api/apiHandler";
import { showToastMessage } from "@/utils/utils";
import { useVerification } from "@/context/VerificationContext";

interface IVerification {
  user: User | null;
}
export default function OtpVerification({ user }: IVerification) {
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { updateVerificationStatus } = useVerification();

  const sendOtpMutation = useMutation({
    mutationFn: () =>
      postData(
        `/verification/send-otp`,
        {
          method: "email", // or "phone" based on your logic
        },
        {}
      ),
    onSuccess: () => {
      toast.success("OTP sent successfully!");
      setIsOtpSent(true);
      setLoading(false);
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error.response?.data?.message || "Failed to send OTP",
        position: "top-right",
      });
      setLoading(false);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: () =>
      postData(
        `/verification/verify-otp`,
        {
          code: otp,
          method: "email", // or "phone" based on your logic
        },
        {}
      ),
    onSuccess: () => {
      toast.success("OTP verified!");
      updateVerificationStatus("email", true);
      queryClient.removeQueries(); // optional cleanup
      router.push("/dashboard");
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error.response?.data?.message || "OTP verification failed",
        position: "top-right",
      });
      setLoading(false);
    },
  });
  function maskEmail(email: string): string {
    const [name, domain] = email.split("@");
    const visibleChars = 3;
    const maskedName =
      name.length > visibleChars
        ? name.substring(0, visibleChars) +
        "*".repeat(name.length - visibleChars)
        : "*".repeat(name.length);
    return `${maskedName}@${domain}`;
  }

  const handleChange = (event: React.FormEvent<HTMLDivElement>) => {
    const value = (event.target as HTMLInputElement).value;
    setOtp(value);
  };

  return (
    <div className="space-y-6  max-w-sm mx-auto mt-5 text-center flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-warning-700">Verification</h2>
      {!isOtpSent && user ? (
        <>
          <p className="text-sm text-gray-300 mb-4">
            Click the button to send an OTP to your registered email.{" "}
            {maskEmail(user.email)}
          </p>
          <Button
            onClick={() => {
              setLoading(true);
              sendOtpMutation.mutate();
            }}
            isLoading={loading}
            color="primary"
          >
            Send OTP
          </Button>
        </>
      ) : (
        user && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setLoading(true);
              verifyOtpMutation.mutate();
            }}
            className="w-full flex flex-col items-center space-y-4"
          >
            <p className="text-sm text-gray-300">
              Enter the 6-digit code sent to your email
            </p>

            {/* @ts-ignore */}
            <InputOtp
              {...({
                length: 6,
                defaultValue: otp,
                color: "default",
                classNames: { segmentWrapper: "gap-x-2" },
                onChange: handleChange,
                inputMode: "numeric",
              } as any)}
            />

            <Button
              type="submit"
              disabled={otp.length !== 6 || loading}
              isLoading={loading}
              color="primary"
              className="w-full"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
          </form>
        )
      )}
    </div>
  );
}
