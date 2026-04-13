const User = require("../models/userModel");
const Notification = require("../models/notificationModel");
const asyncHandler = require("express-async-handler");

exports.getAllNotifications = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate({
    path: "notifications",
    options: { sort: { createdAt: -1 } },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.status(200).json({ notifications: user.notifications });
});

exports.clearAllNotificationByUser = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Find the user
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // Delete all notifications linked to this user
  await Notification.deleteMany({ user: userId });

  // Clear the notification references in the user's document
  user.notifications = [];
  await User.findByIdAndUpdate(userId, { $set: { notifications: [] } });

  res.status(200).json({
    success: true,
    message: "All notifications cleared",
  });
});
