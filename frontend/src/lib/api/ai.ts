import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const getToken = (): string | null =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

const axiosInstance = axios.create({ baseURL: `${API_URL}/ai` });

axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export type AiStadiumFilter = {
  location: string | null;
  priceMin: number | null;
  priceMax: number | null;
  minPlayers: number | null;
  openAt: string | null;
  dayOfWeek: string | null;
};

export type AiStadiumSearchResult<TStadium = unknown> = {
  success: boolean;
  count: number;
  parsed: AiStadiumFilter;
  query: Record<string, unknown>;
  data: TStadium[];
};

export const aiSearchStadiums = async <TStadium = unknown>(
  query: string
): Promise<AiStadiumSearchResult<TStadium>> => {
  const res = await axiosInstance.post("/search-stadiums", { query });
  return res.data;
};

export type DescriptionType = "stadium" | "academy";

export const aiGenerateDescription = async (
  type: DescriptionType,
  fields: Record<string, unknown>
): Promise<string> => {
  const res = await axiosInstance.post("/generate-description", { type, ...fields });
  return res.data.description as string;
};

export type ChatMessage = { role: "user" | "assistant"; content: string };

export const aiChat = async (messages: ChatMessage[]): Promise<string> => {
  const res = await axiosInstance.post("/chat", { messages });
  return res.data.reply as string;
};

export type BracketMatch = {
  round: number;
  matchNumber: number;
  team1: { id: string; name: string } | null;
  team2: { id: string; name: string } | null;
  bye: boolean;
  scheduledAt: string | null;
  stadium: { id: string; name: string } | null;
};

export type BracketResult = {
  success: boolean;
  tournament: { id: string; name: string };
  totalRounds: number;
  totalTeams: number;
  byes: number;
  matches: BracketMatch[];
  notes: string;
};

export const aiGenerateBracket = async (tournamentId: string): Promise<BracketResult> => {
  const res = await axiosInstance.post("/generate-bracket", { tournamentId });
  return res.data;
};

export type ReviewSummary = {
  success: boolean;
  count: number;
  averageRating: number;
  pros: string[];
  cons: string[];
  summary: string;
};

export const aiReviewSummary = async (stadiumId: string): Promise<ReviewSummary> => {
  const res = await axiosInstance.get(`/review-summary/${stadiumId}`);
  return res.data;
};

export type PlayerSkills = {
  position: "goalkeeper" | "defender" | "midfielder" | "forward" | null;
  skillLevel: number | null;
  preferredFoot: "left" | "right" | "both" | null;
  bio?: string;
};

export type SuggestedMember = {
  user: {
    id: string;
    username: string;
    position: string | null;
    skillLevel: number | null;
    preferredFoot: string | null;
  };
  reason: string;
};

export type SuggestMembersResult = {
  success: boolean;
  team: { id: string; name: string };
  missingPositions: { position: string; needed: number }[];
  suggestions: SuggestedMember[];
  notes: string;
};

export const aiSuggestTeamMembers = async (
  teamId: string
): Promise<SuggestMembersResult> => {
  const res = await axiosInstance.post("/suggest-team-members", { teamId });
  return res.data;
};
