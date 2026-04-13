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

export const getAllAcademies = async () => {
  const res = await axiosInstance.get('academies');
  return res.data?.data || [];
};

export const getAcademyById = async (id: string) => {
  const res = await axiosInstance.get(`academies/${id}`);
  return res.data?.data || null;
};