import axios from "axios";
import { PlayerSkills } from "./ai";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const getToken = (): string | null =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

const axiosInstance = axios.create({ baseURL: `${API_URL}/users` });
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getMySkills = async (): Promise<PlayerSkills> => {
  const res = await axiosInstance.get("/me/skills");
  return res.data.data as PlayerSkills;
};

export const updateMySkills = async (skills: Partial<PlayerSkills>): Promise<PlayerSkills> => {
  const res = await axiosInstance.put("/me/skills", skills);
  return res.data.data.skills as PlayerSkills;
};
