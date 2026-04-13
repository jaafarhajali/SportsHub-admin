const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const notificationController = require("../controllers/notificationController");

router.get("/", authMiddleware.auth, notificationController.getAllNotifications);
router.delete("/clear-all", authMiddleware.auth, notificationController.clearAllNotificationByUser);

module.exports = router;