const express = require('express');
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Expenses (Omnia Finance)
 *   description: API for managing user's financial expenses.
 */

// Apply protect middleware to all expense routes
router.use(protect);

/**
 * @swagger
 * /expenses:
 *   get:
 *     summary: Retrieve all expenses for the authenticated user.
 *     description: Fetches a list of all financial expenses belonging to the current user. Supports filtering by category, date range, tags, and text search.
 *     tags: [Expenses (Omnia Finance)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [food, transport, housing, utilities, entertainment, shopping, education, health, work, bills, savings, other]
 *         required: false
 *         description: Optional. Filter expenses by category.
 *         example: food
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         required: false
 *         description: Optional. Start date (ISO 8601) to filter expenses occurring after or on this date.
 *         example: 2024-11-01T00:00:00.000Z
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         required: false
 *         description: Optional. End date (ISO 8601) to filter expenses occurring before or on this date.
 *         example: 2024-11-30T23:59:59.000Z
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         required: false
 *         description: Optional. Filter expenses by a specific tag.
 *         example: travel
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Optional. Search for text in expense description, category, or tags.
 *         example: "dinner"
 *     responses:
 *       200:
 *         description: A list of expenses.
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
 *                     $ref: '#/components/schemas/Expense'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     summary: Create a new expense for the authenticated user.
 *     description: Records a new financial expense. The `user` field is automatically set.
 *     tags: [Expenses (Omnia Finance)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, category, date]
 *             properties:
 *               description: { type: string, minLength: 3, maxLength: 200, example: "Coffee with client" }
 *               amount: { type: number, format: float, minimum: 0.01, example: 4.50 }
 *               category: { type: string, enum: [food, transport, housing, utilities, entertainment, shopping, education, health, work, bills, savings, other], example: "food" }
 *               date: { type: string, format: "date-time", example: "2024-11-20T10:00:00.000Z" }
 *               tags: { type: array, items: { type: string }, example: ["work", "drinks"] }
 *               paymentMethod: { type: string, enum: [cash, credit_card, debit_card, bank_transfer, mobile_money, other], example: "credit_card" }
 *               receiptUrl: { type: string, format: "url", example: "https://example.com/receipts/coffee_nov2024.jpg" }
 *     responses:
 *       201:
 *         description: Expense recorded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Expense recorded successfully!" }
 *                 data:
 *                   $ref: '#/components/schemas/Expense'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.route('/').get(getExpenses).post(createExpense);

/**
 * @swagger
 * /expenses/{id}:
 *   get:
 *     summary: Retrieve a single expense by its ID.
 *     description: Fetches details of a specific expense. The expense must belong to the authenticated user.
 *     tags: [Expenses (Omnia Finance)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the expense to retrieve.
 *         example: 60d0fe4f5b5f7e001c0d3a84
 *     responses:
 *       200:
 *         description: Expense details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/Expense'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     summary: Update an existing expense.
 *     description: Modifies details of an existing expense. Only the expense's owner can update it.
 *     tags: [Expenses (Omnia Finance)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the expense to update.
 *         example: 60d0fe4f5b5f7e001c0d3a84
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description: { type: string, minLength: 3, maxLength: 200, example: "Lunch with team" }
 *               amount: { type: number, format: float, minimum: 0.01, example: 35.00 }
 *               category: { type: string, enum: [food, transport, housing, utilities, entertainment, shopping, education, health, work, bills, savings, other], example: "work" }
 *               date: { type: string, format: "date-time", example: "2024-11-21T13:00:00.000Z" }
 *               tags: { type: array, items: { type: string }, example: ["team", "meal"] }
 *               paymentMethod: { type: string, enum: [cash, credit_card, debit_card, bank_transfer, mobile_money, other], example: "debit_card" }
 *               receiptUrl: { type: string, format: "url", example: "https://example.com/receipts/lunch_nov2024.jpg" }
 *     responses:
 *       200:
 *         description: Expense updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Expense updated successfully!" }
 *                 data:
 *                   $ref: '#/components/schemas/Expense'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     summary: Delete an expense.
 *     description: Removes a financial expense record. Only the expense's owner can delete it.
 *     tags: [Expenses (Omnia Finance)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the expense to delete.
 *         example: 60d0fe4f5b5f7e001c0d3a84
 *     responses:
 *       200:
 *         description: Expense deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Expense deleted successfully!" }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.route('/:id').get(getExpense).put(updateExpense).delete(deleteExpense);

module.exports = router;