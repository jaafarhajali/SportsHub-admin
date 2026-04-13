'use client';
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BookingsTable from "@/components/tables/BookingsTable";
import { Booking } from "@/types/Booking";
import { useState } from "react";
import { AddBookingModal } from "../modal/bookings/AddBookingModal";
import { exportTableToExcel } from "@/lib/api/dashboard/export";
import { getAllBookings, getBookingsByOwner } from "@/lib/api/dashboard/bookings";
import { useUser } from "@/context/UserContext";



export default function BookingsDashboard() {
    const { user } = useUser();
    const [isAddBookingModalOpen, setIsAddBookingModalOpen] = useState(false);
    const [tableData, setTableData] = useState<Booking[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const handleAddBooking = () => {
        setIsAddBookingModalOpen(true);
    };

    const fetchBookings = async () => {
        try {
            setLoading(true);
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

    return (
        <div>
            <PageBreadcrumb pageTitle="Bookings Table" />
            <div className="space-y-6">
                <ComponentCard
                    title="Bookings Table"
                    showAddButton={true}
                    addButtonText="Add Book"
                    onAddClick={handleAddBooking}
                    showExportButton={loading ? false : true}
                    onExportClick={() => exportTableToExcel("bookings")}
                    showRefreshButton
                    onRefreshClick={fetchBookings}
                >
                    <BookingsTable
                        tableData={tableData}
                        setTableData={setTableData}
                        loading={loading}
                        setLoading={setLoading}
                    />
                </ComponentCard>
            </div>

            {/* Add User Modal */}
            <AddBookingModal
                isOpen={isAddBookingModalOpen}
                onClose={() => setIsAddBookingModalOpen(false)}
                setTableData={setTableData}
            />
        </div>
    );
}