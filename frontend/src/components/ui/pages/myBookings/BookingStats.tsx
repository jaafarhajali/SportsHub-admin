'use client'
import React from 'react';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

interface BookingStatsProps {
    bookings: any[];
}

export function BookingStats({ bookings }: BookingStatsProps) {
    const stats = {
        total: bookings.length,
        approved: bookings.filter(b => b.status === 'approved').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
        completed: bookings.filter(b => b.status === 'completed').length,
    };

    const statItems = [
        { label: 'Total Bookings', value: stats.total, icon: Calendar, color: 'blue' },
        { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'green' },
        { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'purple' },
        { label: 'Cancelled', value: stats.cancelled, icon: XCircle, color: 'red' },
    ];

    const getColorClasses = (color: string) => {
        const colors = {
            blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
            green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
            purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
            red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
        };
        return colors[color as keyof typeof colors] || colors.blue;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statItems.map((item) => {
                const Icon = item.icon;
                return (
                    <div key={item.label} className="bg-white dark:bg-stone-800 rounded-xl border border-gray-200 dark:border-stone-700 p-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-lg ${getColorClasses(item.color)}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.label}</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}