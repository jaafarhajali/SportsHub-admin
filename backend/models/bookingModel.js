const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  stadiumId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stadium",
    required: true,
  },

  matchDate: {
    type: Date,
    required: [true, "Match date is required"],
  },

  timeSlot: {
    type: String,
    required: [true, "Time slot is required"],
  },

  refereeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Referee",
  },

  status: {
    type: String,
    enum: ["approved", "cancelled", "completed"],
    default: "approved",
  },

  price: {
    type: Number,
    required: true,
  },

  penaltyApplied: {
    type: Boolean,
    default: false,
  },

  isPaid:{
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
