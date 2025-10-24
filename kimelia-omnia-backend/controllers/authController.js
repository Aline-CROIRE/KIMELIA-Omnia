const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');
const { sendVerificationEmail } = require('../services/emailService'); // Import email service
const crypto = require('crypto'); // For comparing verification tokens


// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // 1. Basic input validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please enter all required fields: name, email, and password.');
  }

  // 2. Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(409);
    throw new Error('A user with this email address already exists. Please log in or use a different email.');
  }

  // 3. Create new user
  const allowedRoles = ['individual', 'student', 'startup'];
  const userRole = role && allowedRoles.includes(role) ? role : 'individual';

  const user = await User.create({
    name,
    email,
    password,
    role: userRole,
    isVerified: false, // User is not verified by default
  });

  // 4. Generate verification token and send email
  if (user) {
    const verificationToken = user.getVerificationToken(); // Generates, hashes, and sets expiry
    await user.save(); // Save the user with the hashed token and expiry

    // Send verification email
    await sendVerificationEmail({
      email: user.email,
      name: user.name,
      verificationToken,
      frontendUrl: process.env.FRONTEND_URL,
    });

    res.status(201).json({
      message: `User registered successfully! A verification email has been sent to ${user.email}. Please verify your email to log in.`,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      // No token on registration until verified
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data provided. Could not create user.');
  }
});

// @desc    Authenticate user & get JWT token
// @route   POST /api/v1/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Basic input validation
  if (!email || !password) {
    res.status(400);
    throw new Error('Please enter both email and password.');
  }

  // 2. Check for user email and explicitly select password for comparison
  const user = await User.findOne({ email }).select('+password');

  // 3. Validate user existence and password
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid credentials. Please check your email and password.');
  }

  // 4. Check if user is verified
  if (!user.isVerified) {
    res.status(401);
    throw new Error('Your email address is not verified. Please check your inbox for a verification email or request a new one.');
  }

  // 5. Respond with user data and JWT
  const userResponse = user.toObject();
  delete userResponse.password; // Exclude password from the response

  res.json({
    ...userResponse,
    token: generateToken(user._id),
    message: 'Logged in successfully!',
  });
});

// @desc    Verify user email
// @route   POST /api/v1/auth/verify-email
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.body; // Or from req.query if it's a GET request from email link

    if (!token) {
        res.status(400);
        throw new Error('Verification token is missing.');
    }

    // Hash the incoming token for comparison with the stored hashed token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user by verification token and check if it's still valid
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() }, // Token must not be expired
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired verification token. Please try registering again or request a new verification email.');
    }

    // Mark user as verified, clear token fields
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    res.status(200).json({
      message: 'Email verified successfully! You can now log in.',
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
    });
});

// @desc    Get the authenticated user's profile
// @route   GET /api/v1/auth/profile
// @access  Private (requires JWT)
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified, // Include verification status
      settings: user.settings,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } else {
    res.status(404);
    throw new Error('User profile not found.');
  }
});

// @desc    Update the authenticated user's profile
// @route   PUT /api/v1/auth/profile
// @access  Private (requires JWT)
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('+password');

    if (user) {
        user.name = req.body.name || user.name;
        // If email is updated, mark as unverified and send new verification email
        if (req.body.email && req.body.email !== user.email) {
            const existingUserWithEmail = await User.findOne({ email: req.body.email });
            if (existingUserWithEmail) {
                res.status(409);
                throw new Error('This email is already registered by another user.');
            }
            user.email = req.body.email;
            user.isVerified = false; // Mark as unverified on email change
            const verificationToken = user.getVerificationToken();
            await user.save(); // Save with new email, token, and unverified status
            await sendVerificationEmail({
              email: user.email,
              name: user.name,
              verificationToken,
              frontendUrl: process.env.FRONTEND_URL,
            });
            res.status(200).json({
                message: `Profile updated, and a new verification email has been sent to ${user.email}. Please verify your new email address.`,
                _id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified
            });
            return; // Exit early as a new verification process starts
        }

        const allowedRoles = ['individual', 'student', 'startup'];
        if (req.body.role && allowedRoles.includes(req.body.role)) {
            user.role = req.body.role;
        } else if (req.body.role && !allowedRoles.includes(req.body.role) && req.body.role !== user.role) {
            res.status(400);
            throw new Error(`Invalid role '${req.body.role}'. Allowed roles are: ${allowedRoles.join(', ')}.`);
        }

        if (req.body.password) {
            user.password = req.body.password;
        }

        if (req.body.settings && typeof req.body.settings === 'object') {
            user.settings = { ...user.settings, ...req.body.settings };
        }

        const updatedUser = await user.save();

        const userResponse = updatedUser.toObject();
        delete userResponse.password;

        res.json({
            ...userResponse,
            token: generateToken(updatedUser._id),
            message: 'Profile updated successfully!',
        });
    } else {
        res.status(404);
        throw new Error('User not found. Could not update profile.');
    }
});


module.exports = {
  registerUser,
  loginUser,
  verifyEmail, 
  getUserProfile,
  updateUserProfile,
};