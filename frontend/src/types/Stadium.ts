// types/Stadium.ts
export interface Stadium {
  _id: string;
  ownerId: {
    _id: string;
    username: string;
    email?: string;
  };
  name: string;
  location: string;
  photos: string[];
  pricePerMatch: number;
  maxPlayers: number;
  penaltyPolicy: {
    hoursBefore: string;
    penaltyAmount: string;
  };
  workingHours: {
    start: string;
    end: string;
  };
  createdAt: string;
}

export interface PenaltyPolicy {
    hoursBefore: number | "";
    penaltyAmount: number | "";
}

export interface WorkingHours {
    start: string;
    end: string;
}