// Add this to your existing dashboard controller or create a new roles controller
const Role = require("../models/roleModel");
const asyncHandler = require("express-async-handler");

// @desc    Get all roles (for select input)
// @route   GET /api/roles
// @access  Admin
exports.getAllRoles = asyncHandler(async (req, res) => {
  const roles = await Role.find({}, "name description").sort({ name: 1 });

  // Return a plain array suitable for a <select> input
  res.status(200).json(roles);
});

// If you prefer a simpler response format for the frontend:
exports.getRolesSimple = asyncHandler(async (req, res) => {
  const roles = await Role.find({}, "name description").sort({ name: 1 });
  res.json(roles); // Direct array response
});
