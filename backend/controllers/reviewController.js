const asyncHandler = require("express-async-handler");
const Review = require("../models/reviewModel");
const Stadium = require("../models/stadiumModel");

// List reviews for a stadium
exports.getStadiumReviews = asyncHandler(async (req, res) => {
  const { stadiumId } = req.params;
  const reviews = await Review.find({ stadium: stadiumId })
    .populate("user", "username profilePhoto")
    .sort({ createdAt: -1 });
  res.json({ success: true, count: reviews.length, data: reviews });
});

// Create a review (user must have booked the stadium — optional check omitted for now)
exports.createReview = asyncHandler(async (req, res) => {
  const { stadiumId, rating, comment } = req.body;
  if (!stadiumId || !rating || !comment) {
    return res.status(400).json({ error: "stadiumId, rating, and comment are required" });
  }
  const stadium = await Stadium.findById(stadiumId);
  if (!stadium) return res.status(404).json({ error: "Stadium not found" });

  try {
    const review = await Review.create({
      user: req.user.id,
      stadium: stadiumId,
      rating,
      comment,
    });
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "You already reviewed this stadium" });
    }
    throw err;
  }
});

// Delete own review
exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ error: "Review not found" });
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Not authorized" });
  }
  await review.deleteOne();
  res.json({ success: true });
});
