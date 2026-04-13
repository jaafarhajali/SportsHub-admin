const mongoose = require("mongoose");

const tournamentSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Always the stadium owner
    required: true,
  },
  stadiumId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stadium",
    required: true,
  },
  name: {
    type: String,
    required: [true, "Tournament name is required"],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  entryPricePerTeam: {
    type: Number,
    required: [true, "Entry price per team is required"],
    min: [0, "Entry price cannot be negative"],
  },
  rewardPrize: {
    type: Number,
    required: [true, "Reward prize is required"],
    min: [0, "Reward prize cannot be negative"],
  },
  teams: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
  ],
  maxTeams: {
    type: Number,
    required: [true, "Maximum number of teams is required"],
    min: [2, "At least two teams must be allowed"],
  },
  startDate: {
    type: Date,
    required: [true, "Start date is required"],
  },
  endDate: {
    type: Date,
    required: [true, "End date is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Could be admin or stadium owner
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
});

const Tournament = mongoose.model("Tournament", tournamentSchema);

module.exports = Tournament;
