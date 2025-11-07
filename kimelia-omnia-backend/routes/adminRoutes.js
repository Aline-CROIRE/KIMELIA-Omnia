const express = require('express');
const {
  getAdminData,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
    validateAdminUpdateUser,
    validateIdParam // --- ADDED: Import validateIdParam ---
} = require('../middleware/validationMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative operations for managing users and system settings (Admin role required).
 */

// Apply protect middleware and ensure user has 'admin' role for all admin routes
router.use(protect, authorizeRoles('admin'));

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Retrieve all user accounts (Admin only).
 *     description: Fetches a list of all registered users. This endpoint requires 'admin' role.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all user accounts.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 count: { type: number, example: 5 }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.route('/users')
    .get(getAllUsers);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Retrieve a single user account by ID (Admin only).
 *     description: Fetches details of a specific user. This endpoint requires 'admin' role.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to retrieve.
 *         example: 60d0fe4f5b5f7e001c0d3a7b
 *     responses:
 *       200:
 *         description: User details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     summary: Update a user's details by ID (Admin only).
 *     description: Allows an admin to update a user's name, email, role, verification status, or settings. Passwords cannot be changed via this route for security.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to update.
 *         example: 60d0fe4f5b5f7e001c0d3a7b
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
 *                 example: Admin Edited Name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: New unique email address for the user.
 *                 example: admin.edited@example.com
 *               role:
 *                 type: string
 *                 enum: [individual, student, startup, admin]
 *                 description: New role for the user.
 *                 example: admin
 *               isVerified:
 *                 type: boolean
 *                 description: Manually set email verification status.
 *                 example: true
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
 *                     example: Asia/Tokyo
 *     responses:
 *       200:
 *         description: User updated successfully by admin.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "User updated successfully by admin." }
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     summary: Delete a user account by ID (Admin only).
 *     description: Permanently deletes a user account. This action cannot be undone and requires 'admin' role. An admin cannot delete their own account via this route.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to delete.
 *         example: 60d0fe4f5b5f7e001c0d3a7b
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "User deleted successfully by admin." }
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.route('/users/:id')
    .get(validateIdParam, getUserById) // --- ADDED validateIdParam ---
    .put(validateIdParam, validateAdminUpdateUser, updateUser) // --- ADDED validateIdParam ---
    .delete(validateIdParam, deleteUser); // --- ADDED validateIdParam ---

router.route('/auth/admin-data') // Path for admin-specific data
    .get(getAdminData);

module.exports = router;