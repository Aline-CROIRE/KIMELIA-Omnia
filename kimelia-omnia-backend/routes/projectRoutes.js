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
const { protect } = require('../middleware/authMiddleware'); // Assuming 'authorizeRoles' is no longer used directly here
const {
    
    validateCreateProject,
    validateUpdateProject,
    validateAddRemoveMember, // For adding/removing members
} = require('../middleware/validationMiddleware');

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
 *     summary: Retrieve all projects for the authenticated user.
 *     description: Fetches a list of all projects where the authenticated user is either the owner or a member.
 *     tags: [Projects (Omnia Workspace)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [planning, in-progress, completed, on_hold, cancelled] }
 *         description: Optional. Filter projects by their status.
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [low, medium, high, urgent] }
 *         description: Optional. Filter projects by their priority.
 *       - in: query
 *         name: tag
 *         schema: { type: string }
 *         description: Optional. Filter projects by a specific tag.
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Optional. Search for text in project title or description.
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
 *                   items: { $ref: '#/components/schemas/Project' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       500: { $ref: '#/components/responses/ServerError' }
 *   post:
 *     summary: Create a new project.
 *     description: Creates a new project and sets the authenticated user as the owner.
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
 *               title: { type: string, minLength: 5, maxLength: 200, example: "New Product Launch" }
 *               description: { type: string, maxLength: 1000, example: "Oversee the launch of the new AI-powered product." }
 *               startDate: { type: string, format: "date-time", example: "2024-10-01T00:00:00.000Z" }
 *               endDate: { type: string, format: "date-time", example: "2025-01-31T23:59:59.000Z" }
 *               status: { type: string, enum: [planning, in-progress, completed, on_hold, cancelled], example: "planning" }
 *               priority: { type: string, enum: [low, medium, high, urgent], example: "high" }
 *               members: { type: array, items: { type: string }, description: "Optional list of initial member user IDs.", example: ["60d0fe4f5b5f7e001c0d3a7c"] }
 *               tags: { type: array, items: { type: string }, example: ["product", "marketing", "cross-functional"] }
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
 *                 data: { $ref: '#/components/schemas/Project' }
 *       400: { $ref: '#/components/responses/BadRequestError' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       404: { description: "User not found for member ID", content: { "application/json": { "schema": { "$ref": "#/components/schemas/ErrorResponse" } } } }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.route('/')
    .get(getProjects)
    .post(validateCreateProject, createProject);

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Retrieve a single project by its ID.
 *     description: Fetches details of a specific project. The user must be the owner or a member.
 *     tags: [Projects (Omnia Workspace)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
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
 *                 data: { $ref: '#/components/schemas/Project' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/ServerError' }
 *   put:
 *     summary: Update an existing project.
 *     description: Modifies details of an existing project. Only the project owner can update it.
 *     tags: [Projects (Omnia Workspace)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
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
 *               title: { type: string, minLength: 5, maxLength: 200, example: "Updated Q4 Marketing Campaign" }
 *               description: { type: string, maxLength: 1000, example: "Revised plan for Q4 product launch, focusing on digital ads." }
 *               startDate: { type: string, format: "date-time", example: "2024-10-05T00:00:00.000Z" }
 *               endDate: { type: string, format: "date-time", example: "2025-01-15T23:59:59.000Z" }
 *               status: { type: string, enum: [planning, in-progress, completed, on_hold, cancelled], example: "on_hold" }
 *               priority: { type: string, enum: [low, medium, high, urgent], example: "medium" }
 *               tags: { type: array, items: { type: string }, example: ["marketing", "delay"] }
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
 *                 data: { $ref: '#/components/schemas/Project' }
 *       400: { $ref: '#/components/responses/BadRequestError' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/ServerError' }
 *   delete:
 *     summary: Delete a project.
 *     description: Removes a project. Only the project owner can delete it.
 *     tags: [Projects (Omnia Workspace)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
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
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.route('/:id')
    // No Joi validation middleware for ':id' parameter here,
    // relying on controller-level Types.ObjectId.isValid checks
    .get(getProject)
    .put(validateUpdateProject, updateProject)
    .delete(deleteProject);

/**
 * @swagger
 * /projects/{id}/members:
 *   post:
 *     summary: Add a member to a project.
 *     description: Adds a user as a member to an existing project. Only the project owner can add members.
 *     tags: [Projects (Omnia Workspace)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: The ID of the project to add a member to.
 *         example: 60d0fe4f5b5f7e001c0d3a83
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [memberId]
 *             properties:
 *               memberId: { type: string, description: "The ID of the user to add as a member.", example: "60d0fe4f5b5f7e001c0d3a7c" }
 *     responses:
 *       200:
 *         description: Member added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Member added to project successfully!" }
 *                 data: { $ref: '#/components/schemas/Project' }
 *       400: { $ref: '#/components/responses/BadRequestError' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { description: "Project or User not found.", content: { "application/json": { "schema": { "$ref": "#/components/schemas/ErrorResponse" } } } }
 *       500: { $ref: '#/components/responses/ServerError' }
 *   delete:
 *     summary: Remove a member from a project.
 *     description: Removes a user from an existing project. Only the project owner can remove members.
 *     tags: [Projects (Omnia Workspace)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: The ID of the project to remove a member from.
 *         example: 60d0fe4f5b5f7e001c0d3a83
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [memberId]
 *             properties:
 *               memberId: { type: string, description: "The ID of the user to remove.", example: "60d0fe4f5b5f7e001c0d3a7c" }
 *     responses:
 *       200:
 *         description: Member removed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Member removed from project successfully!" }
 *                 data: { $ref: '#/components/schemas/Project' }
 *       400: { $ref: '#/components/responses/BadRequestError' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { description: "Project or Member not found.", content: { "application/json": { "schema": { "$ref": "#/components/schemas/ErrorResponse" } } } }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.route('/:id/members')
    .post(validateAddRemoveMember, addProjectMember)
    .delete(validateAddRemoveMember, removeProjectMember); // Use DELETE with body for memberId

module.exports = router;