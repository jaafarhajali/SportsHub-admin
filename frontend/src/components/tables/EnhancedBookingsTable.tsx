'use client'
import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Pagination from "./Pagination";
import { cancelBooking, getMyBookings } from "@/lib/api/stadium";
import { Search, RefreshCw } from 'lucide-react';
import { BookingFilter } from "../ui/pages/myBookings/BookingFilter";
import { BookingStats } from "../ui/pages/myBookings/BookingStats";
import { BookingTableRow } from "../ui/pages/myBookings/BookingTableRow";

export default function EnhancedBookingsTable() {
    const [tableData, setTableData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [filterOption, setFilterOption] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const itemsPerPage = 5;

    const fetchBookings = async (showRefreshLoader = false) => {
        if (showRefreshLoader) setRefreshing(true);
        try {
            const data = await getMyBookings();
            const sortedData = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setTableData(sortedData);
        } catch (err) {
            console.error("Failed to fetch bookings:", err);
        } finally {
            setLoading(false);
            if (showRefreshLoader) setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancelBooking = async (bookingId: string) => {
        const confirmed = window.confirm("Are you sure you want to cancel this booking?");
        if (!confirmed) return;

        try {
            const result = await cancelBooking(bookingId);
            if (result) {
                setTableData((prevData) =>
                    prevData.map((booking) =>
                        booking._id === bookingId
                            ? { ...booking, status: "cancelled", penaltyApplied: result.penaltyApplied }
                            : booking
                    )
                );

                fetchBookings(true);
            }
        } catch (error) {
            console.error("Cancellation failed:", error);
        }
    };

    const handleRefresh = () => {
        fetchBookings(true);
    };

    // Filter logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filteredData = tableData.filter((b) => {
        const matchDate = new Date(b.matchDate);
        matchDate.setHours(0, 0, 0, 0);

        // Search filter
        if (searchTerm) {
            const searchMatch = b.stadiumId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.timeSlot.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.status.toLowerCase().includes(searchTerm.toLowerCase());
            if (!searchMatch) return false;
        }

        // Date/Status filter
        if (filterOption === "all") return true;
        if (["approved", "cancelled", "completed"].includes(filterOption)) {
            return b.status === filterOption;
        }
        if (filterOption === "today") return matchDate.getTime() === today.getTime();
        if (filterOption === "tomorrow") {
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            return matchDate.getTime() === tomorrow.getTime();
        }
        if (filterOption === "upcoming") return matchDate > today;
        if (filterOption === "past") return matchDate < today;

        return true;
    });

    const currentBookings = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <BookingStats bookings={tableData} />

            <BookingFilter
                filterOption={filterOption}
                onFilterChange={setFilterOption}
                totalBookings={tableData.length}
                filteredCount={filteredData.length}
            />

            <div className="bg-white dark:bg-stone-800 rounded-xl border border-gray-200 dark:border-stone-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-stone-700">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Booking History
                        </h2>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search bookings..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50 dark:bg-stone-900">
                            <TableRow>
                                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                    Stadium
                                </TableCell>
                                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                    Date
                                </TableCell>
                                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                    Time
                                </TableCell>
                                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                    Status
                                </TableCell>
                                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                    Penalty
                                </TableCell>
                                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                    Action
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {currentBookings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Search className="w-12 h-12 text-gray-400" />
                                            <p className="text-gray-500 dark:text-gray-400">
                                                {searchTerm ? 'No bookings match your search' : 'No bookings found'}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentBookings.map((booking) => (
                                    <BookingTableRow
                                        key={booking._id}
                                        booking={booking}
                                        onCancelBooking={handleCancelBooking}
                                    />
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {filteredData.length > 0 && (
                    <div className="p-6 border-t border-gray-200 dark:border-stone-700">
                        <div className="flex justify-center">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}