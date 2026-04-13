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

export const addAcademy = async (formData: FormData) => {
    const res = await axiosInstance.post("academies", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
} 

export const updateAcademy = async (id, updatedData) => {
  const fd = new FormData();

  Object.entries(updatedData).forEach(([key, value]) => {
    if (key === "photos") {
      (value as File[] | undefined)?.forEach((file) => fd.append("photos", file));
    } else if (value !== undefined && value !== null && value !== "") {
      fd.append(key, String(value));
    }
  });
  const res = await axiosInstance.put(`academies/${id}`, fd, {
    headers: {
      "Content-type": "multipart/form-data",
    }
  });

  return res.data;
}

export async function deleteAcademy(id: string) {
  const res = await axiosInstance.delete(`academies/${id}`);
  return res.data;
}

export async function getAllAcademies() {
  const res = await axiosInstance.get("academies");
  return res.data.data;
}

export const getAcademyByOwner = async (ownerId: string) => {
  const res = await axiosInstance.get(`academies/owner/${ownerId}`);
  return res.data.data;
};