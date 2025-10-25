const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Budget:
 *       type: object
 *       required:
 *         - user
 *         - category
 *         - limitAmount
 *         - startDate
 *         - endDate
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated unique ID of the budget.
 *           readOnly: true
 *           example: 60d0fe4f5b5f7e001c0d3a85
 *         user:
 *           type: string
 *           description: The ID of the user to whom this budget belongs.
 *           readOnly: true
 *           example: 60d0fe4f5b5f7e001c0d3a7b
 *         category:
 *           type: string
 *           enum: [food, transport, housing, utilities, entertainment, shopping, education, health, work, bills, savings, other, all]
 *           description: The category for which this budget is set. 'all' for an overall budget.
 *           example: food
 *         limitAmount:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: The maximum amount budgeted for the specified category within the period.
 *           example: 500.00
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: The start date of the budget period.
 *           example: 2024-11-01T00:00:00.000Z
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: The end date of the budget period.
 *           example: 2024-11-30T23:59:59.000Z
 *         periodType:
 *           type: string
 *           enum: [daily, weekly, monthly, yearly, custom]
 *           default: custom
 *           description: The type of budgeting period.
 *           example: monthly
 *         alertThreshold:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 100
 *           description: Percentage of limit at which to send an alert (e.g., 80 for 80% usage).
 *           example: 80
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the budget record was created.
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the budget record was last updated.
 *           readOnly: true
 */
const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: ['food', 'transport', 'housing', 'utilities', 'entertainment', 'shopping', 'education', 'health', 'work', 'bills', 'savings', 'other', 'all'],
      required: [true, 'Please select a category for the budget'],
    },
    limitAmount: {
      type: Number,
      required: [true, 'Please set a budget limit amount'],
      min: [0, 'Limit amount cannot be negative'],
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide a start date for the budget period'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide an end date for the budget period'],
    },
    periodType: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom'],
      default: 'custom',
    },
    alertThreshold: {
        type: Number,
        min: 0,
        max: 100,
        default: 80, // Alert when 80% of budget is used
    }
  },
  {
    timestamps: true,
  }
);

// Middleware to ensure endDate is after startDate
budgetSchema.pre('save', function(next) {
  if (this.startDate && this.endDate && this.startDate >= this.endDate) {
    next(new Error('Budget end date must be after start date.'));
  } else {
    next();
  }
});

budgetSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.startDate && update.endDate && new Date(update.startDate) >= new Date(update.endDate)) {
    next(new Error('Updated budget end date must be after updated start date.'));
  } else {
    next();
  }
});


module.exports = mongoose.model('Budget', budgetSchema);