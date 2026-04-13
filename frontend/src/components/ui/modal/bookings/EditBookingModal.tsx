'use client';
import React, { useEffect, useState } from "react";
import { Modal } from "..";
import { getAllUsers } from "@/lib/api/dashboard/users";
import { getAllStadiums, getStadiumById } from "@/lib/api/stadium";
import { updateBooking } from "@/lib/api/dashboard/bookings";
import { toast } from "react-toastify";
import { Booking } from "@/types/Booking";
import { getStadiumsByOwner } from "@/lib/api/dashboard/stadiums";
import { useUser } from "@/context/UserContext";

interface EditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onUpdate: (updated: Booking) => void;
}


export const EditBookingModal: React.FC<EditBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
  onUpdate,
}) => {
  const { user } = useUser();
  const [stadiums, setStadiums] = useState([]);
  const [users, setUsers] = useState([]);
  const [stadiumId, setStadiumId] = useState("");
  const [userId, setUserId] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (user?.role === "admin") {
        getAllStadiums().then((res) => setStadiums(res));
      } else {
        getStadiumsByOwner(user?.id).then((res) => setStadiums(res.data));
      }
      getAllUsers().then((res) => setUsers(res.data.users));

      if (booking) {
        setStadiumId(booking.stadiumId._id || booking.stadiumId);
        setUserId(booking.userId._id || booking.userId);
        setMatchDate(booking.matchDate.split("T")[0]);
        setTimeSlot(booking.timeSlot);
      }
    }
  }, [isOpen, booking]);

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
          return entryDate.toDateString() === selectedDate.toDateString();
        });

        const freeSlots = calendarEntry?.slots
          ?.filter((slot: any) => !slot.isBooked || slot.bookingId === booking?._id)
          .map((slot: any) => slot.startTime) || [];

        setAvailableSlots(freeSlots);
      } catch (err) {
        console.error(err);
        setAvailableSlots([]);
      }
    };

    fetchAvailableSlots();
  }, [stadiumId, matchDate, booking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    try {
      const res = await updateBooking(booking._id, {
        stadiumId,
        userId,
        matchDate,
        timeSlot,
      });

      onUpdate(res.data);
      onClose();
    } catch (err) {
      toast.error("Failed to update booking");
      console.error(err);
    }
  };

  if (!isOpen || !booking) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="p-6 w-[400px]">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
        Edit Booking
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Stadium Select */}
        <div>
          <label className="block text-sm dark:text-white mb-1">Stadium</label>
          <select value={stadiumId} onChange={e => setStadiumId(e.target.value)} className="w-full p-2 dark:bg-stone-000 border rounded dark:text-white">
            {stadiums.map((s: any) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* User Select */}
        <div>
          <label className="block text-sm mb-1 dark:text-white">User</label>
          <select value={userId} onChange={e => setUserId(e.target.value)} className="w-full p-2 border rounded dark:bg-stone-900 dark:text-white">
            {users.map((u: any) => (
              <option key={u._id} value={u._id}>{u.username}</option>
            ))}
          </select>
        </div>

        {/* Match Date */}
        <div>
          <label className="block text-sm mb-1 dark:text-white">Match Date</label>
          <input type="date" value={matchDate} onChange={e => setMatchDate(e.target.value)} className="w-full p-2 border rounded dark:text-white" />
        </div>

        {/* Time Slot */}
        <div>
          <label className="block text-sm mb-1 dark:text-white">Time Slot</label>
          <select value={timeSlot} onChange={e => setTimeSlot(e.target.value)} className="w-full p-2 border rounded dark:bg-stone-900 dark:text-white">
            {availableSlots.length ? (
              availableSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))
            ) : (
              <option disabled>No available slots</option>
            )}
          </select>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Update Booking
        </button>
      </form>
    </Modal>
  );
};
