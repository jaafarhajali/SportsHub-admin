'use client'
import React from 'react';
import { Filter, Calendar, Clock, CheckCircle } from 'lucide-react';

interface BookingFilterProps {
    filterOption: string;
    onFilterChange: (value: string) => void;
    totalBookings: number;
    filteredCount: number;
}

export function BookingFilter({ filterOption, onFilterChange, totalBookings, filteredCount }: BookingFilterProps) {
    const filterOptions = [
        { value: 'all', label: 'All Bookings', icon: Filter, group: 'general' },
        { value: 'approved', label: 'Approved', icon: CheckCircle, group: 'status' },
        { value: 'cancelled', label: 'Cancelled', icon: Filter, group: 'status' },
        { value: 'completed', label: 'Completed', icon: CheckCircle, group: 'status' },
        { value: 'today', label: 'Today', icon: Calendar, group: 'date' },
        { value: 'tomorrow', label: 'Tomorrow', icon: Calendar, group: 'date' },
        { value: 'upcoming', label: 'Upcoming', icon: Clock, group: 'date' },
        { value: 'past', label: 'Past', icon: Calendar, group: 'date' },
    ];

    return (
        <div className="bg-white dark:bg-stone-800 rounded-xl border border-gray-200 dark:border-stone-700 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filter Bookings</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {filteredCount} of {totalBookings} bookings
                        </p>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                    {filterOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                            <button
                                key={option.value}
                                onClick={() => onFilterChange(option.value)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    filterOption === option.value
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}