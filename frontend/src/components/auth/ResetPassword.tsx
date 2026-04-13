"use client";

import React, { useState } from "react";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { Button } from "lebify-ui";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { resetPassword } from "@/lib/api/auth";

interface ResetPasswordProps {
    token: string;
}

export default function ResetPassword({ token }: ResetPasswordProps) {

    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?]).{8,}$/;


    const router = useRouter();

    React.useEffect(() => {
        if (!token) {
            toast.error("Invalid or missing token. Please use the password reset link sent to your email.");
            router.push("/auth/forgot-password");
        }
    }, [token, router]);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [formData, setFormData] = useState({
        password: "",
        passwordConfirm: "",
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ password?: string; passwordConfirm?: string; general?: string }>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        const newErrors: any = {};
        if (!formData.password) newErrors.password = "Password is required";
        else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
        else if (!passwordPattern.test(formData.password)) newErrors.password = "Password must include at least one uppercase letter, one number, and one special character";

        if (!formData.passwordConfirm) newErrors.passwordConfirm = "Confirm password is required";
        else if (formData.password !== formData.passwordConfirm) newErrors.passwordConfirm = "Passwords do not match";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }

        try {
            const data = await resetPassword(token, formData.password, formData.passwordConfirm);
            toast.success("Password reset successfully");
            router.push("/auth/signin");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 lg:w-1/2 w-full">
            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                <div>
                    <div className="mb-5 sm:mb-8">
                        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                            Reset Password
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Enter your new password below.
                        </p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            {/* New Password */}
                            <div>
                                <Label>
                                    New Password {errors.password && <span className="text-error-500">*</span>}
                                </Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Enter new password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={
                                            !errors.password
                                                ? "border-l-3 border-l-green-700 dark:border-l-green-500"
                                                : "border-l-3 border-l-red-500 dark:border-l-red-500"
                                        }
                                    />
                                    <span
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                                    >
                                        {showPassword ? (
                                            <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                                        ) : (
                                            <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                                        )}
                                    </span>
                                </div>
                                {errors.password && (
                                    <div className="flex items-center gap-2 text-error-500 text-sm pt-2">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-4 h-4"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v3a1 1 0 11-2 0V7zm0 4a1 1 0 112 0v3a1 1 0 11-2 0v-3z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <p>{errors.password}</p>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <Label>
                                    Confirm Password {errors.passwordConfirm && <span className="text-error-500">*</span>}
                                </Label>
                                <div className="relative">
                                    <Input
                                        type={showConfirm ? "text" : "password"}
                                        name="passwordConfirm"
                                        placeholder="Confirm your password"
                                        value={formData.passwordConfirm}
                                        onChange={handleChange}
                                        className={
                                            !errors.passwordConfirm
                                                ? "border-l-3 border-l-green-700 dark:border-l-green-500"
                                                : "border-l-3 border-l-red-500 dark:border-l-red-500"
                                        }
                                    />
                                    <span
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                                    >
                                        {showConfirm ? (
                                            <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                                        ) : (
                                            <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                                        )}
                                    </span>
                                </div>
                                {errors.passwordConfirm && (
                                    <div className="flex items-center gap-2 text-error-500 text-sm pt-2">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-4 h-4"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v3a1 1 0 11-2 0V7zm0 4a1 1 0 112 0v3a1 1 0 11-2 0v-3z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <p>{errors.passwordConfirm}</p>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="mt-1">
                                <Button
                                    type="submit"
                                    variant="sea"
                                    loading={loading}
                                    loadingPosition="right"
                                    loadingSpinner="circle"
                                    hideTextWhenLoading
                                    className="flex items-center justify-center w-full"
                                >
                                    Reset Password
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
