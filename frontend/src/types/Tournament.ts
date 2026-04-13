export interface Tournament {
  _id: string;
  name: string;
  description: string;
  entryPricePerTeam: number;
  rewardPrize: number;
  maxTeams: number;
  startDate: string;
  endDate: string;
  stadiumId: {
    _id: string;
    name: string;
  };
  createdAt: string;
}
