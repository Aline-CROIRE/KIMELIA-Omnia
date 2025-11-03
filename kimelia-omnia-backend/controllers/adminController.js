const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const { Types } = require('mongoose'); // Import Mongoose Types for ObjectId validation


// @desc    Get all users (Admin Only)
// @route   GET /api/v1/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
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
  // --- NEW: Manual validation for ID ---
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid User ID format.');
  }
  // --- END NEW VALIDATION ---

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
    // --- NEW: Manual validation for ID ---
    if (!Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid User ID format.');
    }
    // --- END NEW VALIDATION ---

    const { name, email, role, isVerified, settings } = req.body;

    const updates = {
      name,
      email,
      role,
      isVerified,
      settings,
    };

    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

    if (req.body.password) {
        res.status(400);
        throw new Error('Password cannot be updated via this route. Use a dedicated password reset/change endpoint.');
    }
    delete updates.verificationToken;
    delete updates.verificationTokenExpires;

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
    }).select('-password -verificationToken -verificationTokenExpires');

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
  // --- NEW: Manual validation for ID ---
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid User ID format.');
  }
  // --- END NEW VALIDATION ---

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found for deletion.');
  }

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