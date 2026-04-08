"use client";

import React, { useState } from "react";
import { Button, Input, Card, CardBody, CardHeader } from "@nextui-org/react";
import { IoArrowBack, IoMail, IoLockClosed, IoCheckmarkCircle } from "react-icons/io5";
import { postData } from "@/core/api/apiHandler";
import { showToastMessage } from "@/utils/utils";
import { useRouter } from "next/navigation";
import { InputOtp } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";

type ForgotPasswordStep = "REQUEST" | "VERIFY" | "RESET" | "SUCCESS";

interface IForgotPasswordProps {
    role: string;
}

const ForgotPasswordComponent = ({ role }: IForgotPasswordProps) => {
    const [step, setStep] = useState<ForgotPasswordStep>("REQUEST");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await postData("/auth/forgot-password", { email, role }, {});
            showToastMessage({ type: "success", message: "OTP sent to your email", position: "top-right" });
            setStep("VERIFY");
        } catch (error: any) {
            showToastMessage({
                type: "error",
                message: error.response?.data?.message || "Failed to send OTP",
                position: "top-right"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) return;
        setStep("RESET");
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            showToastMessage({ type: "error", message: "Passwords do not match", position: "top-right" });
            return;
        }
        setIsLoading(true);
        try {
            await postData("/auth/reset-password", {
                email,
                role,
                code: otp,
                newPassword
            }, {});
            showToastMessage({ type: "success", message: "Password reset successful", position: "top-right" });
            setStep("SUCCESS");
        } catch (error: any) {
            showToastMessage({
                type: "error",
                message: error.response?.data?.message || "Verification failed or expired",
                position: "top-right"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const inputClasses = {
        label: "text-[10px] font-black uppercase tracking-[0.2em] text-default-400 mb-2 ml-1",
        inputWrapper: "bg-content1 dark:bg-white/[0.03] border-divider hover:border-warning-500/50 transition-all h-12 rounded-2xl shadow-sm",
        input: "font-medium text-sm text-foreground placeholder:text-default-300",
        base: "mb-2"
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-[440px] px-4"
        >
            <Card className="w-full bg-content1/80 dark:bg-[#0B0F14]/80 backdrop-blur-3xl border border-divider shadow-xl dark:shadow-2xl rounded-[2.5rem] p-2 md:p-4 overflow-hidden relative shadow-slate-200/40 dark:shadow-black/40">
                <div className="absolute top-0 right-0 w-32 h-32 bg-warning-500/10 blur-[60px] rounded-full -mr-16 -mt-16 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-500/5 blur-[60px] rounded-full -ml-12 -mb-12 pointer-events-none" />

                <CardHeader className="flex flex-col items-center pb-2 pt-8 relative z-10">
                    <div className="flex w-full justify-between items-center px-4 mb-4">
                        {step !== "SUCCESS" && (
                            <Button
                                isIconOnly
                                variant="flat"
                                radius="full"
                                size="sm"
                                className="bg-content2/50 backdrop-blur-sm border border-divider hover:bg-warning-500/10 hover:text-warning-500 transition-all"
                                onClick={() => step === "REQUEST" ? router.push("/auth") : setStep(step === "VERIFY" ? "REQUEST" : "VERIFY")}
                            >
                                <IoArrowBack className="text-base" />
                            </Button>
                        )}
                        <div className="flex flex-col items-center flex-1">
                            <h4 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase text-foreground">
                                Forgot <span className="text-warning-500 underline decoration-warning-500/20 underline-offset-4">Password</span>
                            </h4>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="w-1 h-1 rounded-full bg-warning-500 animate-pulse" />
                                <p className="text-[10px] font-black text-default-400 uppercase tracking-[0.3em]">{role} Account</p>
                            </div>
                        </div>
                        <div className="w-10 h-10" />
                    </div>
                </CardHeader>

                <CardBody className="py-6 px-6 md:px-8 relative z-10">
                    <AnimatePresence mode="wait">
                        {step === "REQUEST" && (
                            <motion.form
                                key="request"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleRequestOtp}
                                className="space-y-8"
                            >
                                <div className="space-y-2 text-center">
                                    <p className="text-[11px] font-bold text-default-500 uppercase tracking-widest leading-relaxed">
                                        Enter your email and we will send a one-time code.
                                    </p>
                                </div>
                                <Input
                                    label="Email Address"
                                    placeholder="name@example.com"
                                    labelPlacement="outside"
                                    startContent={<IoMail className="text-default-400 mr-1" size={18} />}
                                    value={email}
                                    onValueChange={setEmail}
                                    isRequired
                                    variant="bordered"
                                    classNames={inputClasses}
                                />
                                <Button
                                    type="submit"
                                    color="warning"
                                    className="w-full font-black uppercase italic tracking-[0.2em] text-xs h-12 rounded-2xl shadow-lg shadow-warning-500/10 bg-warning-500 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    isLoading={isLoading}
                                >
                                    Send OTP
                                </Button>
                            </motion.form>
                        )}

                        {step === "VERIFY" && (
                            <motion.form
                                key="verify"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleVerifyOtp}
                                className="flex flex-col items-center space-y-10"
                            >
                                <div className="text-center space-y-3">
                                    <p className="text-[10px] font-black text-default-400 uppercase tracking-[0.3em]">Code sent to</p>
                                    <div className="px-4 py-2 rounded-xl bg-warning-500/5 border border-warning-500/10 inline-block font-black text-xs text-warning-500 uppercase italic tracking-wider shadow-inner">
                                        {email}
                                    </div>
                                </div>

                                <div className="space-y-4 w-full">
                                    <p className="text-[9px] font-black text-default-400 uppercase tracking-[0.4em] text-center mb-6">Enter 6-digit code</p>
                                    <div className="flex justify-center">
                                        <InputOtp
                                            {...({ length: 6 } as any)}
                                            onValueChange={setOtp}
                                            color="warning"
                                            variant="bordered"
                                            classNames={{
                                                segment: "w-12 h-14 text-lg font-black italic border-divider rounded-xl focus-within:border-warning-500 transition-all",
                                                segmentWrapper: "gap-3",
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="w-full space-y-4">
                                    <Button
                                        type="submit"
                                        color="warning"
                                        className="w-full font-black uppercase italic tracking-[0.2em] text-xs h-12 rounded-2xl shadow-lg shadow-warning-500/10 bg-warning-500 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                        disabled={otp.length !== 6 || isLoading}
                                        isLoading={isLoading}
                                    >
                                        Verify OTP
                                    </Button>

                                    <Button
                                        variant="light"
                                        size="sm"
                                        className="w-full font-black uppercase text-[10px] tracking-widest text-default-400 hover:text-warning-500"
                                        onClick={(e) => handleRequestOtp(e as any)}
                                    >
                                        Resend OTP
                                    </Button>
                                </div>
                            </motion.form>
                        )}

                        {step === "RESET" && (
                            <motion.form
                                key="reset"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleResetPassword}
                                className="space-y-10"
                            >
                                <div className="p-4 rounded-2xl bg-success-500/10 border border-success-500/20 flex items-center justify-center gap-3">
                                   <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
                                   <p className="text-[10px] font-black text-success-600 dark:text-success-400 uppercase tracking-[0.2em] italic">
                                       Verified. You can reset your password.
                                   </p>
                                </div>
                                <div className="space-y-8">
                                    <Input
                                        label="New Password"
                                        placeholder="Min. 8 Characters"
                                        labelPlacement="outside"
                                        type="password"
                                        startContent={<IoLockClosed className="text-default-400 mr-1" size={18} />}
                                        value={newPassword}
                                        onValueChange={setNewPassword}
                                        isRequired
                                        variant="bordered"
                                        classNames={inputClasses}
                                    />
                                    <Input
                                        label="Confirm Password"
                                        placeholder="Repeat Password"
                                        labelPlacement="outside"
                                        type="password"
                                        startContent={<IoLockClosed className="text-default-400 mr-1" size={18} />}
                                        value={confirmPassword}
                                        onValueChange={setConfirmPassword}
                                        isRequired
                                        variant="bordered"
                                        classNames={inputClasses}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    color="warning"
                                    className="w-full font-black uppercase italic tracking-[0.2em] text-xs h-12 rounded-2xl shadow-lg shadow-warning-500/10 bg-warning-500 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    isLoading={isLoading}
                                >
                                    Reset Password
                                </Button>
                            </motion.form>
                        )}

                        {step === "SUCCESS" && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center py-6 space-y-8 text-center"
                            >
                                <div className="relative">
                                   <div className="absolute inset-0 bg-success-500 blur-[30px] opacity-20 animate-pulse" />
                                   <div className="w-24 h-24 bg-success-500/10 rounded-full flex items-center justify-center border-2 border-success-500/30 relative">
                                       <IoCheckmarkCircle className="text-6xl text-success-500" />
                                   </div>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="text-2xl font-black italic tracking-tighter uppercase text-foreground">Password <span className="text-success-500">Reset</span></h4>
                                    <p className="text-[11px] font-bold text-default-500 uppercase tracking-widest leading-relaxed">
                                        Your password has been updated. <br/> You can sign in now.
                                    </p>
                                </div>
                                <Button
                                    color="warning"
                                    className="w-full font-black uppercase italic tracking-[0.2em] text-xs h-12 rounded-2xl shadow-lg shadow-warning-500/10 bg-warning-500 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    onClick={() => {
                                        const r = role.toLowerCase();
                                        const target = r === 'operator' || r === 'team' ? '/auth/operator' : '/auth';
                                        router.push(target);
                                    }}
                                >
                                    Back to Sign In
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardBody>
                
                <div className="pb-8 pt-4 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity">
                   <div className="h-px w-12 bg-gradient-to-r from-transparent to-divider" />
                   <div className="px-4 text-[8px] font-black uppercase tracking-[0.4em] text-default-400 italic">
                      OBAOL Secure
                   </div>
                   <div className="h-px w-12 bg-gradient-to-l from-transparent to-divider" />
                </div>
            </Card>
        </motion.div>
    );
};

export default ForgotPasswordComponent;
