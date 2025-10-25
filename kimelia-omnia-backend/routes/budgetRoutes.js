const express = require('express');
const {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Budgets (Omnia Finance)
 *   description: API for managing user's financial budgets.
 */

// Apply protect middleware to all budget routes
router.use(protect);

/**
 * @swagger
 * /budgets:
 *   get:
 *     summary: Retrieve all budgets for the authenticated user.
 *     description: Fetches a list of all financial budgets belonging to the current user. Supports filtering by category, period type, and active status.
 *     tags: [Budgets (Omnia Finance)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [food, transport, housing, utilities, entertainment, shopping, education, health, work, bills, savings, other, all]
 *         required: false
 *         description: Optional. Filter budgets by category.
 *         example: food
 *       - in: query
 *         name: periodType
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, yearly, custom]
 *         required: false
 *         description: Optional. Filter budgets by period type.
 *         example: monthly
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: boolean
 *         required: false
 *         description: Optional. If true, only return budgets that are currently active (current date falls between startDate and endDate).
 *         example: true
 *     responses:
 *       200:
 *         description: A list of budgets.
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
 *                     $ref: '#/components/schemas/Budget'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     summary: Create a new budget for the authenticated user.
 *     description: Sets up a new financial budget for a specific category and period. The `user` field is automatically set.
 *     tags: [Budgets (Omnia Finance)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [category, limitAmount, startDate, endDate]
 *             properties:
 *               category: { type: string, enum: [food, transport, housing, utilities, entertainment, shopping, education, health, work, bills, savings, other, all], example: "food" }
 *               limitAmount: { type: number, format: float, minimum: 0, example: 300.00 }
 *               startDate: { type: string, format: "date-time", example: "2024-11-01T00:00:00.000Z" }
 *               endDate: { type: string, format: "date-time", example: "2024-11-30T23:59:59.000Z" }
 *               periodType: { type: string, enum: [daily, weekly, monthly, yearly, custom], example: "monthly" }
 *               alertThreshold: { type: number, format: float, minimum: 0, maximum: 100, example: 80 }
 *     responses:
 *       201:
 *         description: Budget created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Budget created successfully!" }
 *                 data:
 *                   $ref: '#/components/schemas/Budget'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       409:
 *         description: An overlapping budget already exists for this category and period.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.route('/').get(getBudgets).post(createBudget);

/**
 * @swagger
 * /budgets/{id}:
 *   get:
 *     summary: Retrieve a single budget by its ID.
 *     description: Fetches details of a specific budget. The budget must belong to the authenticated user.
 *     tags: [Budgets (Omnia Finance)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the budget to retrieve.
 *         example: 60d0fe4f5b5f7e001c0d3a85
 *     responses:
 *       200:
 *         description: Budget details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/Budget'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     summary: Update an existing budget.
 *     description: Modifies details of an existing budget. Only the budget's owner can update it.
 *     tags: [Budgets (Omnia Finance)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the budget to update.
 *         example: 60d0fe4f5b5f7e001c0d3a85
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category: { type: string, enum: [food, transport, housing, utilities, entertainment, shopping, education, health, work, bills, savings, other, all], example: "transport" }
 *               limitAmount: { type: number, format: float, minimum: 0, example: 150.00 }
 *               startDate: { type: string, format: "date-time", example: "2024-12-01T00:00:00.000Z" }
 *               endDate: { type: string, format: "date-time", example: "2024-12-31T23:59:59.000Z" }
 *               periodType: { type: string, enum: [daily, weekly, monthly, yearly, custom], example: "monthly" }
 *               alertThreshold: { type: number, format: float, minimum: 0, maximum: 100, example: 90 }
 *     responses:
 *       200:
 *         description: Budget updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Budget updated successfully!" }
 *                 data:
 *                   $ref: '#/components/schemas/Budget'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         description: An overlapping budget already exists for this category and period.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     summary: Delete a budget.
 *     description: Removes a financial budget record. Only the budget's owner can delete it.
 *     tags: [Budgets (Omnia Finance)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the budget to delete.
 *         example: 60d0fe4f5b5f7e001c0d3a85
 *     responses:
 *       200:
 *         description: Budget deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Budget deleted successfully!" }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.route('/:id').get(getBudget).put(updateBudget).delete(deleteBudget);

module.exports = router;