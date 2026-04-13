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

export async function getAllStadiums() {
  const res = await axiosInstance.get("stadiums");
  return res.data;
}

export const getStadiumsByOwner = async (ownerId: string) => {
  const res = await axiosInstance.get(`stadiums/owner/${ownerId}`);
  return res.data;
};

export const addStadium = async (stadiumData: FormData) => {
  const res = await axiosInstance.post("stadiums", stadiumData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
}

export const updateStadium = async (id, formData) => {
  const fd = new FormData();

  Object.entries(formData).forEach(([key, value]) => {
  if (key === "photos" && Array.isArray(value)) {
    value.forEach((file) => fd.append("photos", file));
  } else if (
    typeof value === "object" &&
    value !== null &&
    !(value instanceof File)
  ) {
    // For nested objects like workingHours or penaltyPolicy
    fd.append(key, JSON.stringify(value));
  } else if (value !== undefined && value !== null && value !== "") {
    fd.append(key, String(value));
  }
});
  const res = await axiosInstance.put(`stadiums/${id}`, fd,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
}

export const deleteStadium = async (id) => {
  const res = await axiosInstance.delete(`stadiums/${id}`);
  return res.data;
}