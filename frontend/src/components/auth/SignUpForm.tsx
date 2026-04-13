"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { Button } from "lebify-ui";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { register } from "@/lib/api/auth";

export default function SignUpForm() {

  const usernamePattern = /^[A-Za-z\s]+$/;
  const phoneNumberPattern = /^\+?[1-9]\d{1,14}$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?]).{8,}$/;



  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (checked: boolean) => {
    setIsChecked(checked);
    setFormData({ ...formData, termsAccepted: checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Basic validation
    const newErrors: any = {};

    if (!formData.username) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (formData.username.length > 30) {
      newErrors.username = "Username must be less than 30 characters";
    } else if (!usernamePattern.test(formData.username)) {
      newErrors.username = "Username should only contain letters and spaces";
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!phoneNumberPattern.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Invalid phone number! Use international format (e.g., +1234567890)";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailPattern.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    } else if (!passwordPattern.test(formData.password)) {
      newErrors.password = "Password must include at least one uppercase letter, one number, and one special character";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Confirm password  do not match";
    }

    if (!formData.termsAccepted) newErrors.checkbox = "You must agree to the terms conditions and privacy policy";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    // Prepare data for API call
    const apiData = {
      username: formData.username,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      password: formData.password,
      passwordConfirm: formData.confirmPassword, // Match the backend's expected field name
      termsAccepted: formData.termsAccepted
    };

    try {
      const data = await register(apiData);
      localStorage.setItem("token", data.token);
      router.push("/auth/signin");
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[Object.keys(err.response.data.errors)[0]] ||
        "Registration failed. Please try again.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar py-12">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your data to sign up!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* <!-- UserName --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      Username {errors.username && (<span className="text-error-500">*</span>)}
                    </Label>
                    <Input
                      id="uname"
                      name="username"
                      type="text"
                      defaultValue={formData.username}
                      placeholder="Enter your username"
                      onChange={handleChange}
                      className={!errors.username ? `border-l-3 border-l-green-700 dark:border-l-green-500` : `border-l-3 border-l-red-500 dark:border-l-red-500`}
                    />
                    {errors.username && (
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
                        <p>{errors.username}</p>
                      </div>
                    )}
                  </div>

                  {/* <!-- Phone Number --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      Phone Number {errors.phoneNumber && (<span className="text-error-500">*</span>)}
                    </Label>
                    <Input
                      type="text"
                      id="phoneNumber"
                      name="phoneNumber"
                      defaultValue={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="Enter your display name"
                      className={!errors.phoneNumber ? `border-l-3 border-l-green-700 dark:border-l-green-500` : `border-l-3 border-l-red-500 dark:border-l-red-500`}
                    />
                    {errors.phoneNumber && (
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
                        <p>{errors.phoneNumber}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* <!-- Email --> */}
                <div>
                  <Label>
                    Email {errors.email && (<span className="text-error-500">*</span>)}
                  </Label>
                  <Input
                    type="text"
                    id="email"
                    name="email"
                    defaultValue={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={!errors.email ? `border-l-3 border-l-green-700 dark:border-l-green-500` : `border-l-3 border-l-red-500 dark:border-l-red-500`}
                  />
                  {errors.email && (
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
                      <p>{errors.email}</p>
                    </div>
                  )}
                </div>

                {/* <!-- Password --> */}
                <div>
                  <Label>
                    Password {errors.password && (<span className="text-error-500">*</span>)}
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      defaultValue={formData.password}
                      onChange={handleChange}
                      className={!errors.password ? `border-l-3 border-l-green-700 dark:border-l-green-500` : `border-l-3 border-l-red-500 dark:border-l-red-500`}
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

                {/* <!-- Confirm Password --> */}
                <div>
                  <Label>
                    Confirm Password {errors.confirmPassword && (<span className="text-error-500">*</span>)}
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Confirm your password"
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      defaultValue={formData.confirmPassword}
                      onChange={handleChange}
                      className={!errors.confirmPassword ? `border-l-3 border-l-green-700 dark:border-l-green-500` : `border-l-3 border-l-red-500 dark:border-l-red-500`}
                    />
                    <span
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                  {errors.confirmPassword && (
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
                      <p>{errors.confirmPassword}</p>
                    </div>
                  )}
                </div>

                {/* <!-- Checkbox --> */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    className="w-5 h-5"
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                  />
                  <p className="inline-block font-normal text-gray-500 dark:text-gray-400 text-sm md:text-base">
                    By creating an account means you agree to the{" "}
                    <span className="text-gray-800 dark:text-white/90">
                      Terms and Conditions,{" "}
                    </span>
                    and our{" "}
                    <span className="text-gray-800 dark:text-white">
                      Privacy Policy
                    </span>
                  </p>
                </div>
                {errors.checkbox && (
                  <div className="flex items-center gap-2 text-error-500 text-sm">
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
                    <p>{errors.checkbox}</p>
                  </div>
                )}
                {/* <!-- Button --> */}
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
                    Sign Up
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Already have an account?{" "}
                <Link
                  href="signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}