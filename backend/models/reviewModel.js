const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stadium: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stadium",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
      maxLength: [1000, "Comment cannot exceed 1000 characters"],
    },
  },
  { timestamps: true }
);

// One review per user per stadium
reviewSchema.index({ user: 1, stadium: 1 }, { unique: true });
reviewSchema.index({ stadium: 1, createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);
