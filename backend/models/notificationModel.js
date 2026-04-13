const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  message: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    enum: ["invite", "info", "other", "stadium-added", "academy-added", "tournament-added"],
    default: "other",
  },
  metadata: {
    type: Object,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
