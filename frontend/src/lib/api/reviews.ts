import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const getToken = (): string | null =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

const axiosInstance = axios.create({ baseURL: `${API_URL}/reviews` });
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export type ReviewUser = {
  _id: string;
  username: string;
  profilePhoto?: string | null;
};

export type Review = {
  _id: string;
  user: ReviewUser;
  stadium: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
};

export const getStadiumReviews = async (stadiumId: string): Promise<Review[]> => {
  const res = await axiosInstance.get(`/stadium/${stadiumId}`);
  return res.data.data as Review[];
};

export const createReview = async (
  stadiumId: string,
  rating: number,
  comment: string
): Promise<Review> => {
  const res = await axiosInstance.post("/", { stadiumId, rating, comment });
  return res.data.data as Review;
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  await axiosInstance.delete(`/${reviewId}`);
};
