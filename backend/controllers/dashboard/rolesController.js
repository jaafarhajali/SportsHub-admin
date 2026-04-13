const asyncHandler = require('express-async-handler');
const Role = require('../../models/roleModel');

// @desc    Get all roles (for select input)
// @route   GET /dashboard/roles
// @access  Admin
exports.getAllRoles = asyncHandler(async (req, res) => {
  const roles = await Role.find()
    .populate('createdBy', 'username') // Populate createdBy with name and email
    .populate('updatedBy', 'username') // Populate updatedBy with name and email
    .sort({ name: 1 });

  res.status(200).json({
    status: 'success',
    data: roles,
  });
});

// @desc    Create a new role
// @route   POST /dashboard/roles
// @access  Admin
exports.addRole = asyncHandler(async (req, res) => {
  const { name } = req.body;
  
  // Assuming you have user ID from authentication middleware (req.user.id)
  const newRole = await Role.create({
    name,
    createdBy: req.user.id, // Set the current user as creator
    updatedBy: req.user.id, // Set the current user as updater
  });

  // Populate the created role before sending response
  const populatedRole = await Role.findById(newRole._id)
    .populate('createdBy', 'username')
    .populate('updatedBy', 'username');

  res.status(201).json({
    status: 'success',
    data: populatedRole,
  });
});

// @desc    Update a role
// @route   PUT /dashboard/roles/:id
// @access  Admin
exports.updateRole = asyncHandler(async (req, res) => {
  const { name } = req.body;
  
  const updatedRole = await Role.findByIdAndUpdate(
    req.params.id,
    {
      name,
      updatedBy: req.user.id, // Set the current user as updater
      updatedAt: Date.now(),
    },
    { new: true }
  )
    .populate('createdBy', 'username')
    .populate('updatedBy', 'username');

  if (!updatedRole) {
    return res.status(404).json({
      status: 'error',
      message: 'Role not found',
    });
  }

  res.status(200).json({
    status: 'success',
    data: updatedRole,
  });
});

// @desc    Delete a role
// @route   DELETE /dashboard/roles/:id
// @access  Admin
exports.deleteRole = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);

  if (!role) {
    return res.status(404).json({
      status: 'error',
      message: 'Role not found',
    });
  }

  // Check if role is being used by any users (optional validation)
  // You might want to add this check based on your User model
  // const User = require('../../models/userModel');
  // const usersWithRole = await User.countDocuments({ role: req.params.id });
  // if (usersWithRole > 0) {
  //   return res.status(400).json({
  //     status: 'error',
  //     message: 'Cannot delete role. It is currently assigned to users.',
  //   });
  // }

  await Role.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Role deleted successfully',
  });
});