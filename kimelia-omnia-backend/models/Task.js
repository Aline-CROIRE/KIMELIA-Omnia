const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - user
 *         - title
 *         - status
 *         - priority
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated unique ID of the task.
 *           readOnly: true
 *           example: 60d0fe4f5b5f7e001c0d3a7c
 *         user:
 *           type: string
 *           description: The ID of the user to whom this task belongs.
 *           readOnly: true
 *           example: 60d0fe4f5b5f7e001c0d3a7b
 *         title:
 *           type: string
 *           description: The title or brief description of the task.
 *           minLength: 3
 *           maxLength: 200
 *           example: Prepare presentation for Q4 review
 *         description:
 *           type: string
 *           description: Optional detailed description of the task.
 *           example: Gather all sales data, create slides, and rehearse for 30 minutes.
 *           nullable: true
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: The planned due date and time for the task.
 *           nullable: true
 *           example: 2024-12-31T17:00:00.000Z
 *         status:
 *           type: string
 *           enum: [pending, in-progress, completed, deferred, cancelled]
 *           default: pending
 *           description: The current status of the task.
 *           example: in-progress
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           default: medium
 *           description: The priority level of the task.
 *           example: high
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Optional tags for categorization (e.g., work, personal, learning).
 *           example: [work, presentation, urgent]
 *         project:
 *           type: string
 *           description: Optional ID of the project this task is part of. (References Project Model, future)
 *           nullable: true
 *           example: 60d0fe4f5b5f7e001c0d3a7d
 *         assignedTo:
 *           type: string
 *           description: Optional ID of another user this task is assigned to (for team environments).
 *           nullable: true
 *           example: 60d0fe4f5b5f7e001c0d3a7e
 *         reminders:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               time:
 *                 type: string
 *                 format: date-time
 *                 description: Time for the reminder.
 *                 example: 2024-12-30T09:00:00.000Z
 *               method:
 *                 type: string
 *                 enum: [email, app_notification]
 *                 description: Method of notification.
 *                 example: app_notification
 *           description: A list of reminder objects for the task.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the task was created.
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the task was last updated.
 *           readOnly: true
 */
const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a task title'],
      trim: true,
      minlength: [3, 'Task title must be at least 3 characters'],
      maxlength: [200, 'Task title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Task description cannot exceed 1000 characters'],
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'deferred', 'cancelled'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    project: { // For future Omnia Workspace integration
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    assignedTo: { // For team collaboration
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reminders: [ // For Omnia Planner notifications
      {
        time: { type: Date, required: true },
        method: { type: String, enum: ['email', 'app_notification'], default: 'app_notification' },
      }
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Task', taskSchema);