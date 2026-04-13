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
  baseURL: `${API_URL}/tournaments`,
});

// Add token to headers
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAllTournaments = async () => {
  const res = await axiosInstance.get("/");
  return res.data;
};

export const joinTournament = async (payload: { tournamentId: string, teamId: string }) => {
  const res = await axiosInstance.post('/join', payload);
  return res.data;
};

export const leaveTournament = async (payload: { tournamentId: string, teamId: string }) => {
  const res = await axiosInstance.post('/leave', payload);
  return res.data;
};
