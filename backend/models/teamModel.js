const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Team name is required"],
    trim: true,
  },
  
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  paidTournaments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
    }
  ],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

const Team = mongoose.model("Team", teamSchema);

module.exports = Team;
