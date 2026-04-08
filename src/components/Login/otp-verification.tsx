"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, InputOtp, Card, CardBody } from "@heroui/react";
import { User } from "@/context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { postData } from "@/core/api/apiHandler";
import { showToastMessage } from "@/utils/utils";
import { useVerification } from "@/context/VerificationContext";
import { motion } from "framer-motion";
import { FiShield, FiMail, FiCheck } from "react-icons/fi";

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
          method: "email",
        },
        {}
      ),
    onSuccess: () => {
      toast.success("OTP sequence transmitted.");
      setIsOtpSent(true);
      setLoading(false);
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error.response?.data?.message || "Transmission failure",
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
          method: "email",
        },
        {}
      ),
    onSuccess: () => {
      toast.success("Identity verified.");
      updateVerificationStatus("email", true);
      queryClient.removeQueries();
      router.push("/dashboard");
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error.response?.data?.message || "Protocol verification failed",
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

  const handleChange = (e: any) => {
    setOtp(e);
  };

  return (
    <Card className="max-w-md w-full mx-auto bg-white/85 dark:bg-content1/50 backdrop-blur-3xl border border-divider shadow-xl dark:shadow-2xl rounded-[2rem] overflow-hidden shadow-slate-200/40 dark:shadow-black/40">
      <CardBody className="p-8 lg:p-10 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-warning-500/10 border border-warning-500/20 flex items-center justify-center mb-8 relative">
          <FiShield className="text-3xl text-warning-500" />
          <div className="absolute inset-0 bg-warning-500/20 blur-xl opacity-40 animate-pulse" />
        </div>

        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase text-foreground">
            Identity <span className="text-warning-500">Verification</span>
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-default-400 opacity-60">
            Node_Access_Control
          </p>
        </div>

        {!isOtpSent && user ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-8 w-full"
          >
            <div className="p-4 rounded-xl bg-content2/50 border border-divider w-full flex items-center gap-4">
               <FiMail className="text-warning-500 text-xl" />
               <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-default-400">Target Protocol</span>
                  <span className="text-sm font-bold">{maskEmail(user.email)}</span>
               </div>
            </div>
            
            <Button
              onClick={() => {
                setLoading(true);
                sendOtpMutation.mutate();
              }}
              isLoading={loading}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-warning-500 to-amber-600 font-black uppercase italic tracking-[0.2em] text-xs shadow-lg shadow-warning-500/10"
            >
              Initialize Access
            </Button>
          </motion.div>
        ) : (
          user && (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={(e) => {
                e.preventDefault();
                setLoading(true);
                verifyOtpMutation.mutate();
              }}
              className="w-full flex flex-col items-center gap-10"
            >
              <div className="space-y-4 w-full text-center">
                <p className="text-[10px] font-black text-default-400 uppercase tracking-[0.3em]">
                   Enter the 6-digit credential code
                </p>
                
                <div className="flex justify-center">
                  <InputOtp
                    {...({ length: 6 } as any)}
                    color="warning"
                    variant="bordered"
                    onValueChange={handleChange}
                    classNames={{
                      segment: "w-11 h-12 lg:w-12 lg:h-14 font-black italic text-lg border-divider rounded-xl",
                      segmentWrapper: "gap-2 lg:gap-3",
                    }}
                  />
                </div>
              </div>

              <div className="w-full space-y-4">
                <Button
                  type="submit"
                  disabled={otp.length !== 6 || loading}
                  isLoading={loading}
                     className="w-full h-14 rounded-2xl bg-gradient-to-r from-warning-500 to-amber-600 font-black uppercase italic tracking-[0.2em] text-xs shadow-lg shadow-warning-500/10"
                >
                  Verify Protocol Access
                </Button>
                
                <button
                  type="button"
                  onClick={() => sendOtpMutation.mutate()}
                  className="w-full text-[10px] font-black uppercase tracking-widest text-default-400 hover:text-warning-500 transition-colors py-2"
                >
                  Re-transmit Sequence
                </button>
              </div>
            </motion.form>
          )
        )}
        
        <div className="mt-10 flex items-center gap-4 opacity-20">
           <div className="h-px w-8 bg-divider" />
           <span className="text-[8px] font-black uppercase tracking-[0.4em]">Secure_Auth_v3</span>
           <div className="h-px w-8 bg-divider" />
        </div>
      </CardBody>
    </Card>
  );
}
