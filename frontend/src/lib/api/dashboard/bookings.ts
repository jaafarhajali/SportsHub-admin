import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Get token from localStorage (only safe to use on the client side)
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Create Axios instance with token
const axiosInstance = axios.create({
  baseURL: `${API_URL}/dashboard/`,
});

// Add token to headers
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAllBookings = async () => {
    const res = await axiosInstance.get('bookings');
    return res.data;
}
export const getBookingsByOwner = async (ownerId: string) => {
    const res = await axiosInstance.get(`bookings/owner/${ownerId}`);
    return res.data;
}

export const createBooking = async (stadiumId, userId, matchDate, timeSlot) => {
    const res = await axiosInstance.post('bookings', {
        stadiumId, userId, matchDate, timeSlot
    });
    return res.data;
}

export const updateBooking = async (bookingId: string, data: any) => {
  const res = await axiosInstance.put(`bookings/${bookingId}`, data);
  return res.data;
};

export const cancelBooking = async (bookingId: string) => {
    const res = await axiosInstance.put(`bookings/cancel/${bookingId}`);
    return res.data;
}