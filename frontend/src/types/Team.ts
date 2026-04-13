import { User } from "./User";

export interface Team {
  _id: string;
  name: string;
  leader: User;
  members: User[]; 
  createdAt: string;
  updatedAt: string;
}