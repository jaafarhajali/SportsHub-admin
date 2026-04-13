const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema(
  {
    startTime: {
      type: String,
      required: true, // e.g., "15:00"
    },
    endTime: {
      type: String,
      required: true, // e.g., "16:30"
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
  },
  { _id: false }
);

const calendarEntrySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    slots: [slotSchema],
  },
  { _id: false }
);

const stadiumSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: [true, "Stadium name is required"],
      lowercase: true,
      trim: true,
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      lowercase: true,
      trim: true,
    },

    photos: {
      type: [String],
      default: [],
    },

    pricePerMatch: {
      type: Number,
      required: true,
      min: [0, "Price per hour must be a positive number"],
    },

    maxPlayers: {
      type: Number,
      required: true,
      min: [1, "There must be at least 1 player allowed"],
    },

    penaltyPolicy: {
      hoursBefore: {
        type: Number,
        required: true,
        min: [0, "Hours before must be non-negative"],
      },
      penaltyAmount: {
        type: Number,
        required: true,
        min: [0, "Penalty amount must be non-negative"],
      },
    },

    workingHours: {
      start: {
        type: String,
        required: true, // e.g., "15:00"
      },
      end: {
        type: String,
        required: true, // e.g., "00:00"
      },
    },

    calendar: [calendarEntrySchema],

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // 🎯 SOLUTION: Force collection name to 'stadiums'
    collection: "stadiums",
  }
);

// Update `updatedAt` timestamp automatically
stadiumSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

stadiumSchema.index({ ownerId: 1, name: 1, location: 1 }, { unique: true });

const Stadium = mongoose.model("Stadium", stadiumSchema);

module.exports = Stadium;
