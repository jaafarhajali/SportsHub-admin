import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// Get token from localStorage
const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// Axios instance with token interceptor
const axiosInstance = axios.create({ baseURL: API_URL });

axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getAllNotifications = async () => {
  try {
    const response = await axiosInstance.get("/notifications");
    return response.data.notifications;
  } catch (error) {
    throw new Error("Failed to fetch notifications");
  }
};

export const clearAllNotifications = async () => {
  try {
    const response = await axiosInstance.delete("/notifications/clear-all");
    return response.data;
  } catch (error) {
    throw new Error("Failed to clear notifications");
  }
};

