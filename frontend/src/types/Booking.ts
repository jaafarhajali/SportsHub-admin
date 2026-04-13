export interface Booking {
  _id: string;
  matchDate: string;
  timeSlot: string;
  status: "approved" | "cancelled" | "completed";
  price: number;
  penaltyApplied: boolean;
  createdAt: string;
  penaltyAmount?: number;

  stadiumId: {
    _id: string;
    name: string;
    location: string;
  };

  userId: {
    _id: string;
    username: string;
    email: string;
  };
}
