"use client";

import React, { useState } from "react";
import { Button, Input, Spacer as HeroSpacer } from "@heroui/react";
import { IoEye, IoEyeOff } from "react-icons/io5";

const Spacer = HeroSpacer as any;
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
        if (password.length < 8) errors.push("at least 8 characters");
        if (!/[A-Z]/.test(password)) errors.push("one uppercase letter");
        if (!/[0-9]/.test(password)) errors.push("one number");
        return errors;
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });

        // Clear errors for the field being edited
        if (errors[field]) {
            setErrors({ ...errors, [field]: "" });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        const passwordErrors = validatePassword(formData.password);
        if (passwordErrors.length > 0) {
            newErrors.password = `Password must contain ${passwordErrors.join(", ")}`;
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

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

                // Redirect to login page
                router.push("/auth/login?role=Associate");
            }
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message ||
                "Registration failed. Please try again.";

            showToastMessage({
                type: "error",
                message: errorMessage,
                position: "top-right",
            });

            setErrors({ general: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    const passwordStrength = validatePassword(formData.password);

    return (
        <AuthLayout title="Associate" subtitle="Registration">
            <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
                <Input
                    type="text"
                    label="Full Name"
                    placeholder="Enter your full name"
                    variant="flat"
                    value={formData.name}
                    onValueChange={(value: string) => handleInputChange("name", value)}
                    isInvalid={!!errors.name}
                    errorMessage={errors.name}
                    isRequired
                    className="w-full"
                />

                <Input
                    type="email"
                    label="Email"
                    placeholder="Enter your email"
                    variant="flat"
                    value={formData.email}
                    onValueChange={(value: string) => handleInputChange("email", value)}
                    isInvalid={!!errors.email}
                    errorMessage={errors.email}
                    isRequired
                    className="w-full"
                />

                <Input
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    placeholder="Enter your password"
                    variant="flat"
                    value={formData.password}
                    onValueChange={(value: string) => handleInputChange("password", value)}
                    isInvalid={!!errors.password}
                    errorMessage={errors.password}
                    isRequired
                    className="w-full"
                    endContent={
                        showPassword ? (
                            <IoEye
                                onClick={() => setShowPassword(false)}
                                className="cursor-pointer text-default-400"
                            />
                        ) : (
                            <IoEyeOff
                                onClick={() => setShowPassword(true)}
                                className="cursor-pointer text-default-400"
                            />
                        )
                    }
                />

                {formData.password && passwordStrength.length > 0 && (
                    <p className="text-xs text-warning -mt-2">
                        Password needs: {passwordStrength.join(", ")}
                    </p>
                )}

                <Input
                    type={showConfirmPassword ? "text" : "password"}
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    variant="flat"
                    value={formData.confirmPassword}
                    onValueChange={(value: string) =>
                        handleInputChange("confirmPassword", value)
                    }
                    isInvalid={!!errors.confirmPassword}
                    errorMessage={errors.confirmPassword}
                    isRequired
                    className="w-full"
                    endContent={
                        showConfirmPassword ? (
                            <IoEye
                                onClick={() => setShowConfirmPassword(false)}
                                className="cursor-pointer text-default-400"
                            />
                        ) : (
                            <IoEyeOff
                                onClick={() => setShowConfirmPassword(true)}
                                className="cursor-pointer text-default-400"
                            />
                        )
                    }
                />

                {errors.general && (
                    <p className="text-danger text-sm text-center">{errors.general}</p>
                )}

                <Spacer y={2} />

                <Button
                    className="w-full font-bold"
                    variant="ghost"
                    color="warning"
                    type="submit"
                    disabled={isLoading}
                    isLoading={isLoading}
                    size="lg"
                >
                    {isLoading ? "Creating Account..." : "Register"}
                </Button>

                <div className="text-center mt-2">
                    <p className="text-sm text-default-500">
                        Already have an account?{" "}
                        <span
                            onClick={() => router.push("/auth/login?role=Associate")}
                            className="text-warning hover:text-warning-600 cursor-pointer font-semibold transition-colors"
                        >
                            Login here
                        </span>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
};

export default RegisterPage;
