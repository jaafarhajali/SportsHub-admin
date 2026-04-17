const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const aiController = require("../controllers/aiController");

router.post("/search-stadiums", authMiddleware.auth, aiController.searchStadiums);
router.post("/generate-description", authMiddleware.auth, aiController.generateDescription);
router.post("/chat", authMiddleware.auth, aiController.chatbot);
router.post("/generate-bracket", authMiddleware.auth, aiController.generateBracket);
router.get("/review-summary/:stadiumId", authMiddleware.auth, aiController.reviewSummary);
router.post("/suggest-team-members", authMiddleware.auth, aiController.suggestTeamMembers);

module.exports = router;
