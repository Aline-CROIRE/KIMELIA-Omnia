const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     LearningResource:
 *       type: object
 *       required:
 *         - user
 *         - title
 *         - url
 *         - type
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated unique ID of the learning resource.
 *           readOnly: true
 *           example: 60d0fe4f5b5f7e001c0d3a82
 *         user:
 *           type: string
 *           description: The ID of the user to whom this resource belongs.
 *           readOnly: true
 *           example: 60d0fe4f5b5f7e001c0d3a7b
 *         title:
 *           type: string
 *           description: The title of the learning resource.
 *           minLength: 5
 *           maxLength: 300
 *           example: Advanced JavaScript Concepts
 *         description:
 *           type: string
 *           description: A brief summary or description of the resource.
 *           example: In-depth guide covering closures, prototypes, and asynchronous JavaScript.
 *           nullable: true
 *         url:
 *           type: string
 *           format: url
 *           description: The URL link to the learning resource.
 *           example: https://javascript.info/advanced-js
 *         type:
 *           type: string
 *           enum: [article, video, course, book, podcast, tool, other]
 *           description: The type of the learning resource.
 *           example: article
 *         category:
 *           type: string
 *           enum: [programming, marketing, finance, design, self-improvement, other]
 *           default: other
 *           description: The category of the resource.
 *           example: programming
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Optional tags for categorization (e.g., frontend, backend, soft skills).
 *           example: [webdev, async, es6]
 *         relatedGoal:
 *           type: string
 *           description: Optional ID of a goal this resource helps with (References Goal Model).
 *           nullable: true
 *           example: 60d0fe4f5b5f7e001c0d3a81
 *         source:
 *           type: string
 *           enum: [manual, AI_suggested, web_scrape, imported]
 *           default: manual
 *           description: How this resource was added (e.g., manually by user, AI suggestion).
 *           example: AI_suggested
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the resource was created.
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the resource was last updated.
 *           readOnly: true
 */
const learningResourceSchema = new mongoose.Schema( // --- Ensure `new mongoose.Schema` ---
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a resource title'],
      trim: true,
      minlength: [5, 'Resource title must be at least 5 characters'],
      maxlength: [300, 'Resource title cannot exceed 300 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Resource description cannot exceed 1000 characters'],
    },
    url: {
      type: String,
      required: [true, 'Please add a URL for the resource'],
      match: [
        /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i, // Basic URL validation
        'Please enter a valid URL',
      ],
    },
    type: {
      type: String,
      enum: ['article', 'video', 'course', 'book', 'podcast', 'tool', 'other'],
      required: [true, 'Please specify the resource type'],
    },
    category: {
      type: String,
      enum: ['programming', 'marketing', 'finance', 'design', 'self-improvement', 'other'],
      default: 'other',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    relatedGoal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
    },
    source: {
        type: String,
        enum: ['manual', 'AI_suggested', 'web_scrape', 'imported'],
        default: 'manual',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LearningResource', learningResourceSchema);