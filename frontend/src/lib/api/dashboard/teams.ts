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

export const getAllTeams = async () => {
    const res = await axiosInstance.get('teams');
    return res.data
};

export const createTeam = async (name: string, leaderId: string, members: string[] = []) => {
  const res = await axiosInstance.post('teams', { name, leaderId, members });
  return res.data;
};

export const updateTeam = async (teamId: string, data: { name: string; leaderId: string; members: string[]} ) => {
    const res = await axiosInstance.patch(`/teams/${teamId}`, data);
    return res.data;
}

export const deleteTeam = async (teamId: string) => {
    const res = await axiosInstance.delete(`teams/${teamId}`);
    return res.data;
}

export const searchTeams = async (name: string) => {
  const res = await axiosInstance.get(`teams/search?name=${encodeURIComponent(name)}`);
  return res.data;
};
