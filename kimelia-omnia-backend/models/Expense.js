const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Expense:
 *       type: object
 *       required:
 *         - user
 *         - amount
 *         - category
 *         - date
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated unique ID of the expense.
 *           readOnly: true
 *           example: 60d0fe4f5b5f7e001c0d3a84
 *         user:
 *           type: string
 *           description: The ID of the user to whom this expense belongs.
 *           readOnly: true
 *           example: 60d0fe4f5b5f7e001c0d3a7b
 *         description:
 *           type: string
 *           description: A brief description of what the expense was for.
 *           minLength: 3
 *           maxLength: 200
 *           example: Groceries from local supermarket
 *         amount:
 *           type: number
 *           format: float
 *           minimum: 0.01
 *           description: The monetary amount of the expense.
 *           example: 55.75
 *         category:
 *           type: string
 *           enum: [food, transport, housing, utilities, entertainment, shopping, education, health, work, bills, savings, other]
 *           default: other
 *           description: The category to which the expense belongs.
 *           example: food
 *         date:
 *           type: string
 *           format: date-time
 *           description: The date when the expense occurred.
 *           example: 2024-11-20T10:00:00.000Z
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Optional tags for additional categorization.
 *           example: [weekly, essential]
 *         paymentMethod:
 *           type: string
 *           enum: [cash, credit_card, debit_card, bank_transfer, mobile_money, other]
 *           default: other
 *           description: The method used for payment.
 *           example: credit_card
 *         receiptUrl:
 *           type: string
 *           format: url
 *           description: Optional URL to a scanned receipt or invoice.
 *           nullable: true
 *           example: https://example.com/receipts/grocery_nov2024.jpg
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the expense record was created.
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the expense record was last updated.
 *           readOnly: true
 */
const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      trim: true,
      minlength: [3, 'Description must be at least 3 characters'],
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Please add an amount'],
      min: [0.01, 'Amount must be a positive number'],
    },
    category: {
      type: String,
      enum: ['food', 'transport', 'housing', 'utilities', 'entertainment', 'shopping', 'education', 'health', 'work', 'bills', 'savings', 'other'],
      default: 'other',
      required: [true, 'Please select a category'],
    },
    date: {
      type: Date,
      required: [true, 'Please add a date for the expense'],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    paymentMethod: {
      type: String,
      enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'mobile_money', 'other'],
      default: 'other',
    },
    receiptUrl: {
      type: String,
      match: [
        /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i, // Basic URL validation
        'Please enter a valid URL for the receipt',
      ],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Expense', expenseSchema);