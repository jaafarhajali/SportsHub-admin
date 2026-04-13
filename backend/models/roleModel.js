const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Role name is required"],
    trim: true,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Role = mongoose.model("Role", roleSchema);

module.exports = Role;
