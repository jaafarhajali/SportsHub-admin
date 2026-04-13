"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { Button } from "lebify-ui";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { login } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import GoogleSignInButton from "./GoogleSignInButton";
import { toast } from "react-toastify";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const newErrors: any = {};

    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const data = await login(formData);

      console.log(data.success);
      if (!data.success) {
        toast.error(data.message);
      } else {
        localStorage.setItem("token", data.token);
        router.push("/home");
      }
    } catch (err) {
      // Only network or unexpected errors reach here
      toast.error("Something went wrong. Please try again later.");
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
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  {/* Email Field */}
                  <Label>
                    Email {errors.email && (<span className="text-error-500">*</span>)}
                  </Label>
                  <Input id="uname" name="email" type="text" defaultValue={formData.email}
                    placeholder="Enter your email" onChange={handleChange} className={!errors.email ? `border-l-3
                    border-l-green-700 dark:border-l-green-500` : `border-l-3 border-l-red-500 dark:border-l-red-500`
                    } />
                  {errors.email && (
                    <div className="flex items-center gap-2 text-error-500 text-sm pt-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"
                        aria-hidden="true">
                        <path fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v3a1 1 0 11-2 0V7zm0 4a1 1 0 112 0v3a1 1 0 11-2 0v-3z"
                          clipRule="evenodd" />
                      </svg>
                      <p>{errors.email}</p>
                    </div>
                  )}
                </div>


                {/*
                <!-- Password --> */}
                <div>
                  <Label>
                    Password {errors.password && (<span className="text-error-500">*</span>)}
                  </Label>
                  <div className="relative">
                    <Input placeholder="Enter your password" type={showPassword ? "text" : "password"} id="password"
                      name="password" value={formData.password} onChange={handleChange} className={!errors.password ?
                        `border-l-3 border-l-green-700 dark:border-l-green-500` : `border-l-3 border-l-red-500
                      dark:border-l-red-500` } />
                    <span onClick={() => setShowPassword(!showPassword)}
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
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"
                        aria-hidden="true">
                        <path fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v3a1 1 0 11-2 0V7zm0 4a1 1 0 112 0v3a1 1 0 11-2 0v-3z"
                          clipRule="evenodd" />
                      </svg>
                      <p>{errors.password}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <Link href="forgot-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400">
                    Forgot password?
                  </Link>
                </div>

                {/*
                <!-- Button --> */}
                <div className="mt-1">
                  <Button type="submit" variant="sea" loading={loading} loadingPosition="right" loadingSpinner="circle"
                    hideTextWhenLoading className="flex items-center justify-center w-full">
                    Sign In
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account? {""}
                <Link href="signup" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}