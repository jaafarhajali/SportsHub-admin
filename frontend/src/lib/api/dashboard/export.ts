import axios from 'axios';
import { headers } from 'next/headers';

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

/**
 * Export a table to Excel and trigger download
 * @param tableName The table name (e.g., "users", "stadiums")
 */
export const exportTableToExcel = async (tableName: string): Promise<void> => {
  try {
    const response = await axiosInstance.get(`export/${tableName}`, {
      responseType: 'blob', // Important: treat response as binary blob
    });

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tableName}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to export table:', error);
    throw error;
  }
};
