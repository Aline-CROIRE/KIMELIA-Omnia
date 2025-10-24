const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Goal:
 *       type: object
 *       required:
 *         - user
 *         - title
 *         - targetDate
 *         - status
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated unique ID of the goal.
 *           readOnly: true
 *           example: 60d0fe4f5b5f7e001c0d3a81
 *         user:
 *           type: string
 *           description: The ID of the user to whom this goal belongs.
 *           readOnly: true
 *           example: 60d0fe4f5b5f7e001c0d3a7b
 *         title:
 *           type: string
 *           description: A concise title for the goal.
 *           minLength: 5
 *           maxLength: 200
 *           example: Learn Node.js backend development
 *         description:
 *           type: string
 *           description: Detailed description or motivation for the goal.
 *           example: Understand core concepts, build a REST API, and deploy to cloud.
 *           nullable: true
 *         category:
 *           type: string
 *           enum: [professional, personal, education, health, finance, other]
 *           default: personal
 *           description: The category of the goal.
 *           example: education
 *         targetDate:
 *           type: string
 *           format: date-time
 *           description: The target completion date for the goal.
 *           example: 2025-06-30T23:59:59.000Z
 *         progress:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 100
 *           default: 0
 *           description: Current progress of the goal in percentage.
 *           example: 50.5
 *         status:
 *           type: string
 *           enum: [active, completed, overdue, cancelled, on_hold]
 *           default: active
 *           description: The current status of the goal.
 *           example: active
 *         relatedTasks:
 *           type: array
 *           items:
 *             type: string
 *           description: IDs of tasks related to achieving this goal (References Task Model).
 *           example: ["60d0fe4f5b5f7e001c0d3a7c", "60d0fe4f5b5f7e001c0d3a7d"]
 *         reminders:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               time:
 *                 type: string
 *                 format: date-time
 *                 description: Time for the reminder.
 *                 example: 2025-06-15T09:00:00.000Z
 *               message:
 *                 type: string
 *                 description: Reminder message.
 *                 example: "Don't forget to work on your Node.js goal!"
 *           description: A list of reminder objects for the goal.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the goal was created.
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the goal was last updated.
 *           readOnly: true
 */
const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a goal title'],
      trim: true,
      minlength: [5, 'Goal title must be at least 5 characters'],
      maxlength: [200, 'Goal title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Goal description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      enum: ['professional', 'personal', 'education', 'health', 'finance', 'other'],
      default: 'personal',
    },
    targetDate: {
      type: Date,
      required: [true, 'Please provide a target date for the goal'],
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'overdue', 'cancelled', 'on_hold'],
      default: 'active',
    },
    relatedTasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
    reminders: [
      {
        time: { type: Date, required: true },
        message: { type: String, required: true },
      }
    ],
  },
  {
    timestamps: true,
  }
);

// Optional: Add a pre-save hook to automatically update status to 'overdue' if targetDate has passed
goalSchema.pre('save', function(next) {
  if (this.targetDate && this.targetDate < Date.now() && this.status === 'active') {
    this.status = 'overdue';
  }
  next();
});

// For updates, ensure similar logic
goalSchema.pre('findOneAndUpdate', function(next) {
    const update = this.getUpdate();
    if (update.targetDate && update.targetDate < Date.now() && update.status === 'active') {
        update.status = 'overdue';
    }
    next();
});

module.exports = mongoose.model('Goal', goalSchema);