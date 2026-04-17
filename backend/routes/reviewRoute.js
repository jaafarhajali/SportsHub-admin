const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const reviewController = require("../controllers/reviewController");

router.get("/stadium/:stadiumId", reviewController.getStadiumReviews);
router.post("/", authMiddleware.auth, reviewController.createReview);
router.delete("/:id", authMiddleware.auth, reviewController.deleteReview);

module.exports = router;
