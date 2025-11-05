const express = require('express');
const {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
} = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');
const {
   
    validateCreateGoal,
    validateUpdateGoal
} = require('../middleware/validationMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Goals (Omnia Coach)
 *   description: API for tracking and managing personal and professional goals, part of the Omnia Coach module.
 */

// Apply protect middleware to all goal routes
router.use(protect);

/**
 * @swagger
 * /goals:
 *   get:
 *     summary: Retrieve all goals for the authenticated user.
 *     description: Fetches a list of all goals belonging to the current user. Supports filtering by status, category, and text search.
 *     tags: [Goals (Omnia Coach)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, overdue, cancelled, on_hold]
 *         required: false
 *         description: Optional. Filter goals by their status.
 *         example: active
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [professional, personal, education, health, finance, other]
 *         required: false
 *         description: Optional. Filter goals by their category.
 *         example: education
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Optional. Search for text in goal title or description.
 *         example: "project management"
 *     responses:
 *       200:
 *         description: A list of goals.
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
 *                     $ref: '#/components/schemas/Goal'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     summary: Create a new goal for the authenticated user.
 *     description: Adds a new personal or professional goal. The `user` field is automatically set based on the authenticated user.
 *     tags: [Goals (Omnia Coach)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, targetDate]
 *             properties:
 *               title: { type: string, minLength: 5, maxLength: 200, example: "Master React Native" }
 *               description: { type: string, maxLength: 1000, example: "Build 3 mobile apps and contribute to open source." }
 *               category: { type: string, enum: [professional, personal, education, health, finance, other], example: "education" }
 *               targetDate: { type: string, format: "date-time", example: "2025-12-31T23:59:59.000Z" }
 *               progress: { type: number, format: float, minimum: 0, maximum: 100, example: 0 }
 *               status: { type: string, enum: [active, completed, overdue, cancelled, on_hold], example: "active" }
 *               relatedTasks: { type: array, items: { type: string }, example: ["60d0fe4f5b5f7e001c0d3a7c"] }
 *               reminders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     time: { type: string, format: "date-time", example: "2025-11-01T09:00:00.000Z" }
 *                     message: { type: string, example: "Time to work on your React Native skills!" }
 *     responses:
 *       201:
 *         description: Goal created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Goal created successfully!" }
 *                 data:
 *                   $ref: '#/components/schemas/Goal'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.route('/')
    .get(getGoals)
    .post(validateCreateGoal, createGoal);

/**
 * @swagger
 * /goals/{id}:
 *   get:
 *     summary: Retrieve a single goal by its ID.
 *     description: Fetches details of a specific goal. The goal must belong to the authenticated user.
 *     tags: [Goals (Omnia Coach)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the goal to retrieve.
 *         example: 60d0fe4f5b5f7e001c0d3a81
 *     responses:
 *       200:
 *         description: Goal details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/Goal'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     summary: Update an existing goal.
 *     description: Modifies details of an existing goal. Only the goal's owner can update it.
 *     tags: [Goals (Omnia Coach)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the goal to update.
 *         example: 60d0fe4f5b5f7e001c0d3a81
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string, minLength: 5, maxLength: 200, example: "Refine React Native Skills" }
 *               description: { type: string, maxLength: 1000, example: "Focus on performance optimization and state management." }
 *               category: { type: string, enum: [professional, personal, education, health, finance, other], example: "professional" }
 *               targetDate: { type: string, format: "date-time", example: "2026-03-31T23:59:59.000Z" }
 *               progress: { type: number, format: float, minimum: 0, maximum: 100, example: 75 }
 *               status: { type: string, enum: [active, completed, overdue, cancelled, on_hold], example: "active" }
 *               relatedTasks: { type: array, items: { type: string }, example: ["60d0fe4f5b5f7e001c0d3a7d"] }
 *               reminders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     time: { type: string, format: "date-time", example: "2026-02-15T09:00:00.000Z" }
 *                     message: { type: string, example: "Progress check for React Native!" }
 *     responses:
 *       200:
 *         description: Goal updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Goal updated successfully!" }
 *                 data:
 *                   $ref: '#/components/schemas/Goal'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     summary: Delete a goal.
 *     description: Removes a goal from the user's Omnia Coach. Only the goal's owner can delete it.
 *     tags: [Goals (Omnia Coach)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the goal to delete.
 *         example: 60d0fe4f5b5f7e001c0d3a81
 *     responses:
 *       200:
 *         description: Goal deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Goal deleted successfully!" }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.route('/:id')
    // No Joi validation middleware for ':id' parameter here,
    // relying on controller-level Types.ObjectId.isValid checks
    .get(getGoal)
    .put(validateUpdateGoal, updateGoal)
    .delete(deleteGoal);

module.exports = router;