'use client'
import React, { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";

import Actions from "../ui/actions/Actions"
import Pagination from "./Pagination";
import { Booking } from "@/types/Booking";
import { toast } from "react-toastify";
import { getAllBookings, getBookingsByOwner } from "@/lib/api/dashboard/bookings";
import { EditBookingModal } from "../ui/modal/bookings/EditBookingModal";
import { cancelBooking } from "@/lib/api/dashboard/bookings";
import { useUser } from "@/context/UserContext";
import Loading from "../ui/loading";


interface BookingsTableProps {
    tableData: Booking[];
    setTableData: React.Dispatch<React.SetStateAction<Booking[]>>;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}


export default function BookingsTable({
    tableData,
    setTableData,
    loading,
    setLoading,
}: BookingsTableProps) {

    const { user } = useUser();
    const [currentPage, setCurrentPage] = useState(1);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);


    const itemsPerPage = 5;
    // Calculate pagination using the fetched data
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentBookings = tableData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(tableData.length / itemsPerPage);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                let bookings;

                if (user?.role === 'admin') {
                    bookings = await getAllBookings();
                } else if (user?.role === 'stadiumOwner') {
                    bookings = await getBookingsByOwner(user.id);
                }
                const sortedBookings = bookings.data.sort(
                    (a: Booking, b: Booking) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );

                setTableData(sortedBookings);
            } catch (error) {
                console.error('Failed to fetch bookings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [setTableData, setLoading, user?.role, user?.id]);


    const handleCancel = async (id: string) => {
        const confirmed = window.confirm('Are you sure you want to cancel this booking?');
        if (!confirmed) return;

        try {
            await cancelBooking(id);
            toast.success('Booking canceled successfully');
            setTableData(prev =>
                prev.map(booking =>
                    booking._id === id ? { ...booking, status: 'cancelled' } : booking
                )
            );
        } catch (error) {
            console.error('Failed to cancel booking:', error);
            toast.error('Failed to cancel booking');
        }
    };

    // Handle page change
    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handleOpenEditModal = (booking: Booking) => {
        setSelectedBooking(booking);
        setEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setEditModalOpen(false);
        setSelectedBooking(null);
    };

    const handleBookingUpdate = (updated: Booking) => {
        setTableData(prev =>
            prev.map((a) => (a._id === updated._id ? updated : a))
        );
        toast.success('Booking updated successfully!');
    };

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            {/* Table headers remain the same */}
            <div className="w-full overflow-x-auto">
                <div>
                    <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                                >
                                    User
                                </TableCell>

                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                                >
                                    Stadium
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                                >
                                    Match Date
                                </TableCell>

                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                                >
                                    Time Slot
                                </TableCell>

                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                                >
                                    Price
                                </TableCell>

                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                                >
                                    Status
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                                >
                                    Penalty Applied
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                                >
                                    Created At
                                </TableCell>

                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                                >
                                    Action
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="py-10 text-center">
                                        <div className="flex justify-center">
                                            <Loading />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : currentBookings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="py-10 text-center">
                                        <div className="flex justify-center">
                                            No Bookings Founds
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentBookings.map((book, index) => (
                                    <TableRow key={book._id}>

                                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                            {book.userId?.username}
                                        </TableCell>

                                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                            {book.stadiumId.name}
                                        </TableCell>

                                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                            {new Date(book.matchDate).toLocaleDateString()}
                                        </TableCell>

                                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                            {book.timeSlot}
                                        </TableCell>

                                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                            {book.price}
                                        </TableCell>

                                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                            {book.status}
                                        </TableCell>

                                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                            {book.penaltyApplied
                                                ? `Penalty: ${book.penaltyAmount?.toLocaleString()}`
                                                : "No Penalty"}
                                        </TableCell>

                                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                            {new Date(book.createdAt).toLocaleDateString()}
                                        </TableCell>

                                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                            <Actions
                                                onEdit={() => handleOpenEditModal(book)}
                                                onDelete={() => handleCancel(book._id)}
                                                isLastRow={index === currentBookings.length - 1}
                                                deleteLabel="Cancel"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination */}
            {!loading && tableData.length > 0 && (
                <div className="flex justify-center py-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}

            <EditBookingModal
                isOpen={editModalOpen}
                onClose={handleCloseEditModal}
                booking={selectedBooking}
                onUpdate={handleBookingUpdate}
            />

        </div>
    );
}