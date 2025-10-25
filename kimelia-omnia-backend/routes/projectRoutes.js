const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Projects (Omnia Workspace)
 *   description: API for managing team projects and members, part of the Omnia Workspace module.
 */

// Apply protect middleware to all project routes
router.use(protect);

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Retrieve all projects for the authenticated user (owner or member).
 *     description: Fetches a list of all projects where the current user is either the owner or a team member. Supports filtering and searching.
 *     tags: [Projects (Omnia Workspace)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planning, in-progress, completed, on-hold, cancelled]
 *         required: false
 *         description: Optional. Filter projects by their status.
 *         example: in-progress
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         required: false
 *         description: Optional. Filter projects by their priority.
 *         example: high
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Optional. Search for text in project title or description.
 *         example: "Q4 marketing"
 *     responses:
 *       200:
 *         description: A list of projects.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 count: { type: number, example: 2 }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     summary: Create a new project for the authenticated user.
 *     description: Adds a new project. The authenticated user is automatically set as the owner and an initial member.
 *     tags: [Projects (Omnia Workspace)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string, minLength: 5, maxLength: 200, example: "New Product Launch Initiative" }
 *               description: { type: string, maxLength: 1000, example: "Oversee development, marketing, and sales for new product X." }
 *               startDate: { type: string, format: "date-time", example: "2025-01-01T00:00:00.000Z" }
 *               endDate: { type: string, format: "date-time", example: "2025-03-31T23:59:59.000Z" }
 *               status: { type: string, enum: [planning, in-progress, completed, on-hold, cancelled], example: "planning" }
 *               priority: { type: string, enum: [low, medium, high, urgent], example: "high" }
 *               tags: { type: array, items: { type: string }, example: ["product", "planning"] }
 *     responses:
 *       201:
 *         description: Project created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Project created successfully!" }
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.route('/').get(getProjects).post(createProject);

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Retrieve a single project by its ID.
 *     description: Fetches details of a specific project. The user must be the owner or a member of the project.
 *     tags: [Projects (Omnia Workspace)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the project to retrieve.
 *         example: 60d0fe4f5b5f7e001c0d3a83
 *     responses:
 *       200:
 *         description: Project details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     summary: Update an existing project (Owner only).
 *     description: Modifies details of an existing project. Only the project owner can update general project details. Member management uses separate routes.
 *     tags: [Projects (Omnia Workspace)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the project to update.
 *         example: 60d0fe4f5b5f7e001c0d3a83
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string, minLength: 5, maxLength: 200, example: "Refined Q4 Marketing Campaign" }
 *               description: { type: string, maxLength: 1000, example: "Updated strategy for Q4 product launch and holiday sales." }
 *               startDate: { type: string, format: "date-time", example: "2024-10-05T00:00:00.000Z" }
 *               endDate: { type: string, format: "date-time", example: "2025-01-15T23:59:59.000Z" }
 *               status: { type: string, enum: [planning, in-progress, completed, on-hold, cancelled], example: "in-progress" }
 *               priority: { type: string, enum: [low, medium, high, urgent], example: "urgent" }
 *               tags: { type: array, items: { type: string }, example: ["marketing", "holiday-sales"] }
 *     responses:
 *       200:
 *         description: Project updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Project updated successfully!" }
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     summary: Delete a project (Owner only).
 *     description: Permanently removes a project. Only the project owner can delete it. This action is irreversible.
 *     tags: [Projects (Omnia Workspace)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the project to delete.
 *         example: 60d0fe4f5b5f7e001c0d3a83
 *     responses:
 *       200:
 *         description: Project deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Project deleted successfully!" }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.route('/:id').get(getProject).put(updateProject).delete(deleteProject);

/**
 * @swagger
 * /projects/{id}/add-member:
 *   put:
 *     summary: Add a member to a project (Owner only).
 *     description: Adds a user as a member to the specified project. Only the project owner can perform this action. The new member must be an existing user.
 *     tags: [Projects (Omnia Workspace)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the project.
 *         example: 60d0fe4f5b5f7e001c0d3a83
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [memberId]
 *             properties:
 *               memberId:
 *                 type: string
 *                 description: The ID of the user to add as a member.
 *                 example: 60d0fe4f5b5f7e001c0d3a7e
 *     responses:
 *       200:
 *         description: Member added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Member added successfully!" }
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Project or Member user not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               projectNotFound:
 *                 value: { message: "Project not found.", statusCode: 404 }
 *               userNotFound:
 *                 value: { message: "User to be added as a member not found.", statusCode: 404 }
 *       409:
 *         description: User is already a member of this project.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * /projects/{id}/remove-member:
 *   put:
 *     summary: Remove a member from a project (Owner only).
 *     description: Removes a user from the specified project's members list. Only the project owner can perform this action. The owner cannot remove themselves.
 *     tags: [Projects (Omnia Workspace)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the project.
 *         example: 60d0fe4f5b5f7e001c0d3a83
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [memberId]
 *             properties:
 *               memberId:
 *                 type: string
 *                 description: The ID of the user to remove from members.
 *                 example: 60d0fe4f5b5f7e001c0d3a7e
 *     responses:
 *       200:
 *         description: Member removed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Member removed successfully!" }
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid input or trying to remove owner.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               removeOwner:
 *                 value: { message: "Cannot remove project owner from members list via this route.", statusCode: 400 }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Project or user not found in members.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               projectNotFound:
 *                 value: { message: "Project not found.", statusCode: 404 }
 *               memberNotFound:
 *                 value: { message: "User is not a member of this project.", statusCode: 404 }
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id/add-member', addProjectMember);
router.put('/:id/remove-member', removeProjectMember);

module.exports = router;