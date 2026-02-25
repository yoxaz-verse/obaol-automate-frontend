"use client";

import React, { useState } from "react";
import { Button, Input } from "@nextui-org/react";
import { IoEye, IoEyeOff, IoPerson, IoMail, IoLockClosed } from "react-icons/io5";
import { useRouter } from "next/navigation";
import axios from "axios";
import { showToastMessage } from "@/utils/utils";
import AuthLayout from "@/components/Auth/AuthLayout";

const RegisterPage = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Real-time password validation
    const validatePassword = (password: string) => {
        const errors: string[] = [];
        if (password.length < 8) errors.push("8+ chars");
        if (!/[A-Z]/.test(password)) errors.push("1 uppercase");
        if (!/[0-9]/.test(password)) errors.push("1 number");
        return errors;
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: "" });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = "Name is required";

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        const passwordErrors = validatePassword(formData.password);
        if (passwordErrors.length > 0) {
            newErrors.password = `Requirements: ${passwordErrors.join(", ")}`;
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
                {
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                }
            );

            if (response.data.success) {
                showToastMessage({
                    type: "success",
                    message: "Registration successful! Please log in.",
                    position: "top-right",
                });
                router.push("/auth/login?role=Associate");
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Registration failed.";
            showToastMessage({ type: "error", message: errorMessage, position: "top-right" });
            setErrors({ general: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    const passwordStrength = validatePassword(formData.password);

    return (
        <AuthLayout title="Create Account" subtitle="Join the future of logistics.">
            <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit}>
                <Input
                    type="text"
                    label="Full Name"
                    placeholder="John Doe"
                    variant="bordered"
                    labelPlacement="outside"
                    radius="lg"
                    value={formData.name}
                    onValueChange={(value) => handleInputChange("name", value)}
                    isInvalid={!!errors.name}
                    errorMessage={errors.name}
                    startContent={<IoPerson className="text-default-400 pointer-events-none flex-shrink-0" />}
                    classNames={{
                        inputWrapper: "bg-default-50/50 border-default-200 group-data-[focus=true]:border-warning-500",
                        label: "text-default-600 group-data-[filled-within=true]:text-default-600"
                    }}
                />

                <Input
                    type="email"
                    label="Email Address"
                    placeholder="name@company.com"
                    variant="bordered"
                    labelPlacement="outside"
                    radius="lg"
                    value={formData.email}
                    onValueChange={(value) => handleInputChange("email", value)}
                    isInvalid={!!errors.email}
                    errorMessage={errors.email}
                    startContent={<IoMail className="text-default-400 pointer-events-none flex-shrink-0" />}
                    classNames={{
                        inputWrapper: "bg-default-50/50 border-default-200 group-data-[focus=true]:border-warning-500",
                        label: "text-default-600 group-data-[filled-within=true]:text-default-600"
                    }}
                />

                <Input
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    placeholder="••••••••"
                    variant="bordered"
                    labelPlacement="outside"
                    radius="lg"
                    value={formData.password}
                    onValueChange={(value) => handleInputChange("password", value)}
                    isInvalid={!!errors.password}
                    errorMessage={errors.password}
                    startContent={<IoLockClosed className="text-default-400 pointer-events-none flex-shrink-0" />}
                    endContent={
                        <button className="focus:outline-none" type="button" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? (
                                <IoEyeOff className="text-2xl text-default-400 pointer-events-none" />
                            ) : (
                                <IoEye className="text-2xl text-default-400 pointer-events-none" />
                            )}
                        </button>
                    }
                    classNames={{
                        inputWrapper: "bg-default-50/50 border-default-200 group-data-[focus=true]:border-warning-500",
                        label: "text-default-600 group-data-[filled-within=true]:text-default-600"
                    }}
                />

                {formData.password && passwordStrength.length > 0 && (
                    <div className="flex flex-wrap gap-1 -mt-2">
                        {passwordStrength.map((req, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-warning-500/10 text-warning-500 border border-warning-500/20">
                                Missing: {req}
                            </span>
                        ))}
                    </div>
                )}

                <Input
                    type={showConfirmPassword ? "text" : "password"}
                    label="Confirm Password"
                    placeholder="••••••••"
                    variant="bordered"
                    labelPlacement="outside"
                    radius="lg"
                    value={formData.confirmPassword}
                    onValueChange={(value) => handleInputChange("confirmPassword", value)}
                    isInvalid={!!errors.confirmPassword}
                    errorMessage={errors.confirmPassword}
                    startContent={<IoLockClosed className="text-default-400 pointer-events-none flex-shrink-0" />}
                    endContent={
                        <button className="focus:outline-none" type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? (
                                <IoEyeOff className="text-2xl text-default-400 pointer-events-none" />
                            ) : (
                                <IoEye className="text-2xl text-default-400 pointer-events-none" />
                            )}
                        </button>
                    }
                    classNames={{
                        inputWrapper: "bg-default-50/50 border-default-200 group-data-[focus=true]:border-warning-500",
                        label: "text-default-600 group-data-[filled-within=true]:text-default-600"
                    }}
                />

                {errors.general && (
                    <div className="p-3 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger text-sm text-center">
                        {errors.general}
                    </div>
                )}

                <Button
                    className="w-full font-bold bg-warning-500 text-warning-50 shadow-lg shadow-warning-500/20 dark:text-black"
                    size="lg"
                    type="submit"
                    isLoading={isLoading}
                    radius="lg"
                >
                    {isLoading ? "Creating..." : "Create Account"}
                </Button>

                <div className="text-center mt-4 text-sm text-default-500">
                    Already a member?{" "}
                    <button
                        type="button"
                        onClick={() => router.push("/auth/login?role=Associate")}
                        className="text-warning hover:text-warning-400 font-semibold transition-colors focus:outline-none"
                    >
                        Sign In
                    </button>
                </div>
            </form>
        </AuthLayout>
    );
};

export default RegisterPage;
