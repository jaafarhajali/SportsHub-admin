import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Create Axios instance with token
const axiosInstance = axios.create({
  baseURL: `${API_URL}/`,
});

// Add token to headers
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAllStadiums = async () => {
  const res = await axiosInstance.get('/stadiums');
  return res.data?.data || [];
};

export const getStadiumById = async (id: string) => {
  const res = await axiosInstance.get(`/stadiums/${id}`);
  return res.data?.data || null;
};

export const bookStadium = async (stadiumId, matchDate, timeSlot) => {
  const res = await axiosInstance.post(`/bookings/book`, {
    stadiumId,
    matchDate: new Date(matchDate).toISOString(),
    timeSlot,
  });
  return res.data?.data || null;
};

export const getMyBookings = async () => {
  const res = await axiosInstance.get('/bookings/my-bookings');
  return res.data?.data || [];
}

export const cancelBooking = async (bookingId: string) => {
  const res = await axiosInstance.put(`/bookings/${bookingId}/cancel`);
  return res.data?.data || null;
}