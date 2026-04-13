'use client'
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Callback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => { 
    const token = searchParams.get('token');
    console.log(token);
    if (token) {
      localStorage.setItem("token", token);
      router.replace("/dashboard");
    }
  }, [router]);

  return <p>Redirecting...</p>;
}
