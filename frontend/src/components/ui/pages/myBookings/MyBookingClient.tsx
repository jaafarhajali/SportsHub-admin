'use client';
import React, { useEffect, useState } from 'react';
import { Calendar, TrendingUp } from 'lucide-react';
import EnhancedBookingsTable from '@/components/tables/EnhancedBookingsTable';
import { useRouter } from 'next/navigation';

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

export default function MyBookingsPage() {

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
        // Show spinner while auth check is running
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-stone-900">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-600 rounded-xl">
                            <Calendar className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                My Bookings
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Manage and track all your stadium bookings
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <TrendingUp className="w-4 h-4" />
                        <span>Real-time booking status updates</span>
                    </div>
                </div>

                <EnhancedBookingsTable />
            </div>
        </div>
    );
}
