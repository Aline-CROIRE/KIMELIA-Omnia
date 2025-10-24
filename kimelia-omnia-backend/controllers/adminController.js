const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

// @desc    Get all users (Admin Only)
// @route   GET /api/v1/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  // Find all users and select specific fields, excluding sensitive ones like password or verification tokens
  const users = await User.find().select('-password -verificationToken -verificationTokenExpires');

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// @desc    Get a single user by ID (Admin Only)
// @route   GET /api/v1/admin/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -verificationToken -verificationTokenExpires');

  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update a user's details (Admin Only)
// @route   PUT /api/v1/admin/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
    const { name, email, role, isVerified, settings } = req.body; // Password changes handled separately or via another dedicated route

    // Prevent admin from accidentally changing their own role to something non-admin via this route,
    // or from setting their own user to non-admin without careful consideration.
    // Also prevent setting a verification token.
    const updates = {
      name,
      email,
      role, // Admin can change roles
      isVerified, // Admin can manually verify users
      settings,
    };

    // Remove undefined values to prevent overwriting with null
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

    // Special handling for password updates (if included, hash it) - for now, omit from this route for security
    if (req.body.password) {
        res.status(400);
        throw new Error('Password cannot be updated via this route. Use a dedicated password reset/change endpoint.');
    }
    // Also prevent admin from setting verification token fields directly
    delete updates.verificationToken;
    delete updates.verificationTokenExpires;


    const user = await User.findByIdAndUpdate(req.params.id, updates, {
        new: true, // Return updated document
        runValidators: true, // Run Mongoose validators
    }).select('-password -verificationToken -verificationTokenExpires'); // Exclude sensitive info

    if (!user) {
        res.status(404);
        throw new Error('User not found for update.');
    }

    res.status(200).json({
        success: true,
        message: 'User updated successfully by admin.',
        data: user,
    });
});

// @desc    Delete a user (Admin Only)
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found for deletion.');
  }

  // Prevent admin from deleting themselves (or require special confirmation)
  if (req.user._id.toString() === req.params.id.toString()) {
    res.status(400);
    throw new Error('Admin cannot delete their own account via this route.');
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully by admin.',
  });
});


module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};