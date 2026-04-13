'use client';
import React, { useEffect, useState } from "react";
import { getAllUsers } from "@/lib/api/dashboard/users";
import { getAllStadiums } from "@/lib/api/stadium";
import { toast } from "react-toastify";
import { Modal } from "..";
import { createBooking } from "@/lib/api/dashboard/bookings";
import { Booking } from "@/types/Booking";
import { getStadiumById } from "@/lib/api/stadium";
import { useUser } from "@/context/UserContext";
import { getStadiumsByOwner } from "@/lib/api/dashboard/stadiums";


interface AddBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    setTableData: React.Dispatch<React.SetStateAction<Booking[]>>;
}

export const AddBookingModal: React.FC<AddBookingModalProps> = ({
    isOpen,
    onClose,
    setTableData,
}) => {
    const { user } = useUser();
    const [stadiums, setStadiums] = useState<any[]>([]);
    const [users, setUsers] = useState([]);
    const [stadiumId, setStadiumId] = useState("");
    const [userId, setUserId] = useState("");
    const [matchDate, setMatchDate] = useState(() =>
        new Date().toISOString().split("T")[0]
    );
    const [timeSlot, setTimeSlot] = useState("");
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);


    useEffect(() => {
        if (isOpen) {
            if (user?.role === "admin") {
                getAllStadiums().then(setStadiums);
            } else {
                getStadiumsByOwner(user?.id).then((res) => setStadiums(res.data));
            }
            getAllUsers().then((res) => setUsers(res.data.users));
        }
    }, [isOpen]);

    useEffect(() => {
        const fetchAvailableSlots = async () => {
            if (!stadiumId || !matchDate) {
                setAvailableSlots([]);
                return;
            }

            try {
                const stadium = await getStadiumById(stadiumId);
                const calendarEntry = stadium.calendar.find((entry: any) => {
                    const entryDate = new Date(entry.date);
                    const selectedDate = new Date(matchDate);
                    entryDate.setHours(0, 0, 0, 0);
                    selectedDate.setHours(0, 0, 0, 0);
                    return entryDate.getTime() === selectedDate.getTime();
                });

                if (calendarEntry) {
                    const now = new Date();
                    const selectedDate = new Date(matchDate);
                    selectedDate.setHours(0, 0, 0, 0);

                    const freeFutureSlots = calendarEntry.slots
                        .filter((slot: any) => {
                            if (slot.isBooked) return false;

                            // Build the slot time as Date
                            const [hour, minute] = slot.startTime.split(":").map(Number);
                            const slotTime = new Date(matchDate);
                            slotTime.setHours(hour, minute, 0, 0);

                            // Keep only slots in the future
                            return slotTime > now;
                        })
                        .map((slot: any) => slot.startTime);

                    setAvailableSlots(freeFutureSlots);
                } else {
                    setAvailableSlots([]);
                }
            } catch (err) {
                console.error("Failed to fetch stadium:", err);
                setAvailableSlots([]);
            }
        };

        fetchAvailableSlots();
    }, [stadiumId, matchDate]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await createBooking(stadiumId, userId, matchDate, timeSlot);
            toast.success("Booking created successfully!");
            setTableData(prev => [response.data, ...prev]);
            onClose();
        } catch (err) {
            toast.error("Failed to create booking.");
            console.error(err);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="p-6 w-[400px]">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                Add New Booking
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Stadium Select */}
                <div>
                    <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">Stadium</label>
                    <select
                        value={stadiumId}
                        onChange={(e) => setStadiumId(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg dark:bg-stone-800 dark:text-white"
                        required
                    >
                        <option value="">Select a stadium</option>
                        {stadiums && Array.isArray(stadiums) && stadiums.map((s) => (
                            <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                    </select>
                </div>

                {/* User Select */}
                <div>
                    <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">User</label>
                    <select
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg dark:bg-stone-800 dark:text-white"
                        required
                    >
                        <option value="">Select a user</option>
                        {users.map((u: any) => (
                            <option key={u._id} value={u._id}>{u.username}</option>
                        ))}
                    </select>
                </div>

                {/* Match Date */}
                <div>
                    <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">Match Date</label>
                    <input
                        type="date"
                        value={matchDate}
                        onChange={(e) => setMatchDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]} // Prevent selecting past dates
                        className="w-full px-4 py-2 border rounded-lg dark:bg-stone-800 dark:text-white"
                        required
                    />
                </div>

                {/* Time Slot */}
                <div>
                    <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">Time Slot</label>
                    <select
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg dark:bg-stone-800 dark:text-white"
                        required
                        disabled={!availableSlots.length}
                    >
                        <option value="">{availableSlots.length ? "Select a slot" : "No available slots"}</option>
                        {availableSlots.map((slot) => (
                            <option key={slot} value={slot}>{slot}</option>
                        ))}
                    </select>
                </div>
                <button
                    type="submit"
                    className="w-full py-2 mt-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Create Booking
                </button>
            </form>
        </Modal>
    );
};
