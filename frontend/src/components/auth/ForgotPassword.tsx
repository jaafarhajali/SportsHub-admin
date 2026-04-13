"use client";

import React, { useState } from "react";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { Button } from "lebify-ui";
import { forgotPassword } from "@/lib/api/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);

    try {
      const data = await forgotPassword(email);
      setSuccessMsg(data.message || "If that email is in our system, you will receive a reset link.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again later.");
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
              Forgot Password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email to receive a password reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <Label>Email {error && <span className="text-error-500">*</span>}</Label>
                <Input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={!error ? "border-l-3 border-l-green-700 dark:border-l-green-500" : "border-l-3 border-l-red-500 dark:border-l-red-500"}
                />
                {error && (
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
                    <p>{error}</p>
                  </div>
                )}
              </div>

              {successMsg && (
                <div className="text-green-600 dark:text-green-400 text-sm font-semibold">
                  {successMsg}
                </div>
              )}

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
                  Send Reset Link
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
