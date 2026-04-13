// routes/userRoutes.js
const express = require("express");
const { updateUserProfile } = require("../controllers/userController");
const upload = require("../middlewares/upload");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { sendEmailVerification, verifyEmail } = require("../controllers/userController");

const router = express.Router();


// POST /api/users/update-profile
router.post("/update-profile", authMiddleware.auth, upload.single("profilePhoto"), updateUserProfile);
router.post("/send-verification", authMiddleware.auth, sendEmailVerification);
router.get("/verify-email", verifyEmail);
module.exports = router;
