import { Role } from "./Role";
import { Team } from "./Team";

export interface User {
  _id: string;
  username: string;
  isActive: boolean;
  email: string;
  phoneNumber: string;
  profilePhoto?: string;
  role: Role;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;

  // Newly added fields
  team?: Team | string | null;
  wallet: number;
}
