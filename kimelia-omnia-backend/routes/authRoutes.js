const express = require('express');
const {
  registerUser,
  loginUser,
  verifyEmail,
  getUserProfile,
  updateUserProfile,
} = require('../controllers/authController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication, registration, email verification, and profile management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user account and send a verification email.
 *     description: Creates a new user with a specified name, email, password, and an optional role. A verification email is sent to the provided email address, and the user must verify their email before they can log in.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name.
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: Jane Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's unique email address.
 *                 example: jane.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's chosen password (will be hashed).
 *                 minLength: 6
 *                 example: MySecurePassword123
 *               role:
 *                 type: string
 *                 enum: [individual, student, startup]
 *                 description: Optional. The user's role or segment. Defaults to 'individual'.
 *                 example: student
 *     responses:
 *       201:
 *         description: User registered successfully. A verification email has been sent.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully! A verification email has been sent to jane.doe@example.com. Please verify your email to log in.
 *                 _id: { type: 'string', example: '60d0fe4f5b5f7e001c0d3a7b' }
 *                 name: { type: 'string', example: 'Jane Doe' }
 *                 email: { type: 'string', example: 'jane.doe@example.com' }
 *                 role: { type: 'string', example: 'individual' }
 *                 isVerified: { type: 'boolean', example: false }
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify user's email address using a token.
 *     description: Confirms a user's email address using the token received in the verification email.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: The verification token received in the email.
 *                 example: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
 *     responses:
 *       200:
 *         description: Email verified successfully. User can now log in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email verified successfully! You can now log in.
 *                 _id: { type: 'string', example: '60d0fe4f5b5f7e001c0d3a7b' }
 *                 name: { type: 'string', example: 'John Doe' }
 *                 email: { type: 'string', example: 'john.doe@example.com' }
 *                 isVerified: { type: 'boolean', example: true }
 *       400:
 *         description: Invalid or expired token, or token is missing.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingToken:
 *                 value:
 *                   message: Verification token is missing.
 *                   statusCode: 400
 *               invalidOrExpiredToken:
 *                 value:
 *                   message: Invalid or expired verification token. Please try registering again or request a new verification email.
 *                   statusCode: 400
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/verify-email', verifyEmail);


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user and obtain a JWT token.
 *     description: Logs in a user with their email and password, returning user details and an access token. Requires email to be verified.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's registered email address.
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password.
 *                 example: myStrongPassword123
 *     responses:
 *       200:
 *         description: User authenticated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidCredentials:
 *                 value:
 *                   message: Invalid credentials. Please check your email and password.
 *                   statusCode: 401
 *               emailNotVerified:
 *                 value:
 *                   message: Your email address is not verified. Please check your inbox for a verification email or request a new one.
 *                   statusCode: 401
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Retrieve the authenticated user's profile.
 *     description: Fetches the profile details of the currently authenticated user.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *             examples:
 *               userProfile:
 *                 value:
 *                   _id: 60d0fe4f5b5f7e001c0d3a7b
 *                   name: John Doe
 *                   email: john.doe@example.com
 *                   role: individual
 *                   isVerified: true
 *                   settings:
 *                     theme: light
 *                     timezone: UTC
 *                   createdAt: '2023-10-26T10:00:00.000Z'
 *                   updatedAt: '2023-10-26T10:00:00.000Z'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     summary: Update the authenticated user's profile.
 *     description: Allows the authenticated user to update their name, email, password, role (to allowed values), or settings. Changing the email will require re-verification.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name for the user.
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: Jane Smith
 *               email:
 *                 type: string
 *                 format: email
 *                 description: New unique email address for the user. If changed, re-verification is required.
 *                 example: jane.smith@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: New password (will be hashed).
 *                 minLength: 6
 *                 example: NewSecurePass123
 *               role:
 *                 type: string
 *                 enum: [individual, student, startup] # Admin role cannot be set via this route for security
 *                 description: New role for the user (only 'individual', 'student', 'startup' allowed).
 *                 example: student
 *               settings:
 *                 type: object
 *                 description: Partial or full update to user preferences.
 *                 properties:
 *                   theme:
 *                     type: string
 *                     enum: [light, dark, system]
 *                     example: dark
 *                   timezone:
 *                     type: string
 *                     example: Europe/London
 *     responses:
 *       200:
 *         description: User profile updated successfully. If email changed, a new verification email is sent.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully! If email was changed, a new verification email has been sent to new.email@example.com. Please verify your new email address.
 *                 _id: { type: 'string' }
 *                 name: { type: 'string' }
 *                 email: { type: 'string' }
 *                 role: { type: 'string' }
 *                 isVerified: { type: 'boolean' }
 *                 token: { type: 'string' }
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

/**
 * @swagger
 * /auth/admin-data:
 *   get:
 *     summary: Access admin-specific data (Admin only).
 *     description: Retrieves data accessible only by users with the 'admin' role. Demonstrates role-based access control.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Welcome, Admin! Here is your secret data.
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/admin-data', protect, authorizeRoles('admin'), (req, res) => {
    // In a real application, this would fetch and return actual sensitive admin data
    res.json({
        message: `Welcome, Admin ${req.user.name}! Here is your secret data.`,
        user: req.user
    });
});


module.exports = router;