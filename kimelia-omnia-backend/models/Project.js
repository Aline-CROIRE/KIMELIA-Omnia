const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       required:
 *         - owner
 *         - title
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated unique ID of the project.
 *           readOnly: true
 *           example: 60d0fe4f5b5f7e001c0d3a83
 *         owner:
 *           type: string
 *           description: The ID of the user who owns this project.
 *           readOnly: true
 *           example: 60d0fe4f5b5f7e001c0d3a7b
 *         title:
 *           type: string
 *           description: The title of the project.
 *           minLength: 5
 *           maxLength: 200
 *           example: Q4 Marketing Campaign
 *         description:
 *           type: string
 *           description: A detailed description of the project.
 *           example: Plan and execute a multi-channel marketing campaign for Q4 product launch.
 *           nullable: true
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: The planned start date of the project.
 *           nullable: true
 *           example: 2024-10-01T00:00:00.000Z
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: The planned end date of the project.
 *           nullable: true
 *           example: 2024-12-31T23:59:59.000Z
 *         status:
 *           type: string
 *           enum: [planning, in-progress, completed, on_hold, cancelled]
 *           default: planning
 *           description: The current status of the project.
 *           example: in-progress
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           default: medium
 *           description: The priority level of the project.
 *           example: high
 *         members:
 *           type: array
 *           items:
 *             type: string
 *           description: List of user IDs who are members of this project.
 *           example: ["60d0fe4f5b5f7e001c0d3a7c", "60d0fe4f5b5f7e001c0d3a7d"]
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Optional tags for categorization.
 *           example: [marketing, launch, team]
 *         files:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name: { type: string, example: "Brief.pdf" }
 *               url: { type: string, format: url, example: "https://example.com/brief.pdf" }
 *               uploadedAt: { type: string, format: "date-time" }
 *           description: List of attached files.
 *           example: [{ name: "Budget.xlsx", url: "http://example.com/budget.xlsx", uploadedAt: "2024-09-20T10:00:00.000Z" }]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the project was created.
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the project was last updated.
 *           readOnly: true
 */
const projectSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a project title'],
      trim: true,
      minlength: [5, 'Project title must be at least 5 characters'],
      maxlength: [200, 'Project title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Project description cannot exceed 1000 characters'],
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
      // Custom validation for endDate greater than startDate can be done in controller/Joi
    },
    status: {
      type: String,
      enum: ['planning', 'in-progress', 'completed', 'on_hold', 'cancelled'],
      default: 'planning',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    files: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Middleware to ensure endDate is after startDate if both are provided (Mongoose schema level)
projectSchema.pre('save', function (next) {
  if (this.startDate && this.endDate && this.startDate >= this.endDate) {
    next(new Error('Project end date must be after start date.'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Project', projectSchema);