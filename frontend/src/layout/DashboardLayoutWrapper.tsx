'use client';
import { useSidebar } from "@/context/SidebarContext";
import { useUser } from "@/context/UserContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function DashbaordLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isExpanded, isHovered, isMobileOpen } = useSidebar();
    const { user, loading } = useUser();
    const router = useRouter();

    const LoadingSpinner = () => (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 flex items-center justify-center">
            <div className="text-center space-y-6">
                <div className="relative w-20 h-20 mx-auto">
                    <div className="w-20 h-20 border-4 border-green-200 dark:border-stone-600 rounded-full animate-spin border-t-green-600 dark:border-t-green-400"></div>
                    <div className="absolute inset-4 border-2 border-blue-200 dark:border-stone-700 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400 animate-reverse"></div>
                </div>
            </div>
        </div>
    );

    useEffect(() => {
        if (!loading && !user) {
            router.push("/auth/signin");
        }
    }, [user, loading, router]);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
    }

    if (!user && !loading) {
        return null;
    }

    const mainContentMargin = isMobileOpen
        ? "ml-0"
        : isExpanded || isHovered
            ? "lg:ml-[290px]"
            : "lg:ml-[90px]";

    return (
        <div className="relative min-h-screen xl:flex">
            <AppSidebar />
            <Backdrop />

            <div
                className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
            >
                <AppHeader />
                <div className="p-4 mx-auto max-w-screen-2xl md:p-6">
                    {children}
                </div>
            </div>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
                className="!z-[999999]"
            />
        </div>
    );
}
