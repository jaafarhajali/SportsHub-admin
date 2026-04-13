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

// Team service functions
const teamService = {
  fetchTeam: async () => {
    const res = await axiosInstance.get("/teams/my-team");
    return res.data;
  },

  createTeam: async (name: string) => {
    const res = await axiosInstance.post("/teams/create", { name });
    return res.data;
  },

  searchUsers: async (field: string, keyword: string) => {
    const res = await axiosInstance.get("/teams/search", {
      params: { field, keyword },
    });
    return res.data;
  },

  inviteUser: async (userIdToInvite: string, teamId: string) => {
    const res = await axiosInstance.post("/teams/invite", {
      userIdToInvite,
      teamId,
    });
    return res.data;
  },

  removeUser: async (userIdToRemove: string, teamId: string) => {
    const res = await axiosInstance.post("/teams/remove-member", {
      userIdToRemove,
      teamId,
    });
    return res.data;
  },

  deleteTeam: async (teamId: string) => {
    const res = await axiosInstance.post("/teams/delete", { teamId });
    return res.data;
  },

  exitTeam: async (teamId: string) => {
    const res = await axiosInstance.post("/teams/exit", { teamId });
    return res.data;
  },

  acceptInvite: async (teamId: string, notificationId: string) => {
    const res = await axiosInstance.post("/teams/accept", {
      teamId,
      notificationId,
    });
    return res.data;
  },

  rejectInvite: async (notificationId: string) => {
    const res = await axiosInstance.post("/teams/reject", { notificationId });
    return res.data;
  },
};

export default teamService;
