"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) return;

      try {
        const res = await axios.get(`http://localhost:8080/api/users/verify-email?token=${token}`);

        toast.success(res.data.message || "Email verified successfully");

        if (res.data.token) {
          localStorage.setItem("token", res.data.token); // ✅ update token
          window.dispatchEvent(new Event("authStateChange")); // ✅ trigger re-render
        }

        setStatus("success");

        setTimeout(() => {
          router.push("/profile"); // redirect to profile
        }, 2000);
      } catch (err: any) {
        console.error(err);
        toast.error(err.response?.data?.message || "Invalid or expired token");
        setStatus("failed");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center flex-col">
      {status === "verifying" && <p>Verifying your email...</p>}
      {status === "success" && <p>Email verified! Redirecting to your profile...</p>}
      {status === "failed" && <p>Verification failed. Please try again.</p>}
    </div>
  );
}
