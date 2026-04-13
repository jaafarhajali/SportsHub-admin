"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TeamInfoCard from "@/components/user-profile/TeamInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import { useUser } from "@/context/UserContext";

const LoadingSpinner = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 flex items-center justify-center">
        <div className="text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 border-4 border-blue-200 dark:border-stone-600 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>
                <div className="absolute inset-4 border-2 border-purple-200 dark:border-stone-700 rounded-full animate-spin border-t-purple-600 dark:border-t-purple-400 animate-reverse"></div>
            </div>
        </div>
    </div>
);

export default function ProfileContent() {
    const { user } = useUser();
    const router = useRouter();
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.replace("/auth/signin");
        } else if (token) {
            setAuthChecked(true);
        }
    }, [router]);

    if (!authChecked) {
        return <LoadingSpinner />;
    }

    return (
        <>
            <UserMetaCard />
            {console.log("User role:", user?.role)}
            {(user?.role && ["user", "teamleader"].includes(user.role.toLowerCase())) && <TeamInfoCard />}
        </>
    );
}
