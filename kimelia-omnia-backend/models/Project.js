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
 *         - status
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated unique ID of the project.
 *           readOnly: true
 *           example: 60d0fe4f5b5f7e001c0d3a83
 *         owner:
 *           type: string
 *           description: The ID of the user who owns/created this project.
 *           readOnly: true
 *           example: 60d0fe4f5b5f7e001c0d3a7b
 *         title:
 *           type: string
 *           description: The title or name of the project.
 *           minLength: 5
 *           maxLength: 200
 *           example: Q4 Marketing Campaign
 *         description:
 *           type: string
 *           description: Detailed description of the project scope, goals, and objectives.
 *           example: Develop and execute a comprehensive marketing campaign for the Q4 product launch.
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
 *           enum: [planning, in-progress, completed, on-hold, cancelled]
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
 *             description: User ID of a project member.
 *             example: 60d0fe4f5b5f7e001c0d3a7e
 *           description: A list of User IDs of team members collaborating on this project.
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Optional tags for categorization (e.g., marketing, product, internal).
 *           example: [marketing, product, launch]
 *         files:
 *           type: array
 *           items:
 *             type: string
 *             description: IDs of associated files. (Future: link to a File Management module)
 *             example: ["file_id_1", "file_id_2"]
 *           description: A list of IDs representing files associated with the project.
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
    },
    status: {
      type: String,
      enum: ['planning', 'in-progress', 'completed', 'on-hold', 'cancelled'],
      default: 'planning',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    members: [ // Users collaborating on this project
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
    files: [ // For future file management integration
      {
        type: String, // Will store file IDs
      }
    ]
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to ensure owner is always a member
projectSchema.pre('save', function(next) {
  if (this.owner && !this.members.includes(this.owner)) {
    this.members.unshift(this.owner); // Add owner as first member if not already there
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);