"use client";

import React, { useState } from "react";
import { Button, Input, Spacer, Card, CardBody, CardHeader, Divider } from "@nextui-org/react";
import { IoArrowBack, IoMail, IoLockClosed, IoCheckmarkCircle } from "react-icons/io5";
import { postData } from "@/core/api/apiHandler";
import { showToastMessage } from "@/utils/utils";
import { useRouter } from "next/navigation";
import { InputOtp } from "@heroui/react";

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
        setStep("RESET"); // Move to reset step (Verification happens in final step or here)
        // Actually, backend 'reset-password' takes the code. So we just collect it.
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

    return (
        <Card className="max-w-[400px] w-full bg-black/40 backdrop-blur-md border border-white/20 text-white shadow-2xl">
            <CardHeader className="flex flex-col items-center pb-0 pt-6">
                <div className="flex w-full justify-between items-center px-4">
                    {step !== "SUCCESS" && (
                        <Button
                            isIconOnly
                            variant="light"
                            onClick={() => step === "REQUEST" ? router.back() : setStep(step === "VERIFY" ? "REQUEST" : "VERIFY")}
                        >
                            <IoArrowBack className="text-xl" />
                        </Button>
                    )}
                    <h4 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-yellow-600 bg-clip-text text-transparent">
                        Forgot Password
                    </h4>
                    <div className="w-10" />
                </div>
                <p className="text-tiny text-white/50 mt-1 uppercase tracking-widest">{role} Account</p>
            </CardHeader>

            <CardBody className="py-8 px-8">
                {step === "REQUEST" && (
                    <form onSubmit={handleRequestOtp} className="space-y-6">
                        <p className="text-sm text-center text-white/70">
                            Enter your email address and we will send you an OTP to reset your password.
                        </p>
                        <Input
                            label="Email Address"
                            placeholder="name@example.com"
                            labelPlacement="outside"
                            startContent={<IoMail className="text-white/40" />}
                            value={email}
                            onValueChange={setEmail}
                            isRequired
                            variant="bordered"
                            classNames={{
                                label: "text-white/70",
                                input: "text-white",
                                inputWrapper: "border-white/20 hover:border-orange-500/50 focus-within:!border-orange-500",
                            }}
                        />
                        <Button
                            type="submit"
                            color="warning"
                            className="w-full font-bold shadow-lg shadow-orange-500/20"
                            isLoading={isLoading}
                        >
                            Send OTP
                        </Button>
                    </form>
                )}

                {step === "VERIFY" && (
                    <form onSubmit={handleVerifyOtp} className="flex flex-col items-center space-y-8">
                        <div className="text-center">
                            <p className="text-sm text-white/70">Enter the 6-digit code sent to</p>
                            <p className="text-sm font-bold text-orange-400">{email}</p>
                        </div>

                        <InputOtp
                            {...({ length: 6 } as any)}
                            onValueChange={setOtp}
                            color="warning"
                            variant="bordered"
                            classNames={{
                                segment: "text-white border-white/20",
                                segmentWrapper: "gap-2",
                            }}
                        />

                        <Button
                            type="submit"
                            color="warning"
                            className="w-full font-bold shadow-lg shadow-orange-500/20"
                            disabled={otp.length !== 6 || isLoading}
                            isLoading={isLoading}
                        >
                            Verify OTP
                        </Button>

                        <Button
                            variant="light"
                            size="sm"
                            className="text-white/50"
                            onClick={(e) => handleRequestOtp(e as any)}
                        >
                            Resend Code
                        </Button>
                    </form>
                )}

                {step === "RESET" && (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <p className="text-sm text-center text-white/70 italic">
                            Verification successful. Please enter your new password.
                        </p>
                        <div className="space-y-4">
                            <Input
                                label="New Password"
                                placeholder="********"
                                labelPlacement="outside"
                                type="password"
                                startContent={<IoLockClosed className="text-white/40" />}
                                value={newPassword}
                                onValueChange={setNewPassword}
                                isRequired
                                variant="bordered"
                                classNames={{
                                    label: "text-white/70",
                                    input: "text-white",
                                    inputWrapper: "border-white/20 hover:border-orange-500/50 focus-within:!border-orange-500",
                                }}
                            />
                            <Input
                                label="Confirm Password"
                                placeholder="********"
                                labelPlacement="outside"
                                type="password"
                                startContent={<IoLockClosed className="text-white/40" />}
                                value={confirmPassword}
                                onValueChange={setConfirmPassword}
                                isRequired
                                variant="bordered"
                                classNames={{
                                    label: "text-white/70",
                                    input: "text-white",
                                    inputWrapper: "border-white/20 hover:border-orange-500/50 focus-within:!border-orange-500",
                                }}
                            />
                        </div>
                        <Button
                            type="submit"
                            color="warning"
                            className="w-full font-bold shadow-lg shadow-orange-500/20"
                            isLoading={isLoading}
                        >
                            Reset Password
                        </Button>
                    </form>
                )}

                {step === "SUCCESS" && (
                    <div className="flex flex-col items-center py-6 space-y-6">
                        <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center border border-success/30">
                            <IoCheckmarkCircle className="text-5xl text-success" />
                        </div>
                        <div className="text-center space-y-2">
                            <h4 className="text-xl font-bold">Success!</h4>
                            <p className="text-sm text-white/60">Your password has been reset successfully.</p>
                        </div>
                        <Button
                            color="warning"
                            className="w-full font-bold shadow-lg shadow-orange-500/20"
                            onClick={() => router.push(`/auth/${role.toLowerCase()}`)}
                        >
                            Back to Login
                        </Button>
                    </div>
                )}
            </CardBody>
        </Card>
    );
};

export default ForgotPasswordComponent;
