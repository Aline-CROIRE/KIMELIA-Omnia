const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     WellnessRecord:
 *       type: object
 *       required:
 *         - user
 *         - type
 *         - date
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated unique ID of the wellness record.
 *           readOnly: true
 *           example: 60d0fe4f5b5f7e001c0d3a86
 *         user:
 *           type: string
 *           description: The ID of the user to whom this wellness record belongs.
 *           readOnly: true
 *           example: 60d0fe4f5b5f7e001c0d3a7b
 *         type:
 *           type: string
 *           enum: [break, meal, exercise, mindfulness, sleep, water_intake, custom]
 *           description: The type of wellness activity logged.
 *           example: exercise
 *         date:
 *           type: string
 *           format: date-time
 *           description: The date and time when the activity occurred.
 *           example: 2024-11-20T10:30:00.000Z
 *         durationMinutes:
 *           type: number
 *           description: Duration of the activity in minutes (e.g., for exercise, mindfulness, break).
 *           minimum: 1
 *           nullable: true
 *           example: 30
 *         details:
 *           type: string
 *           description: Optional details about the activity (e.g., "Yoga session", "Healthy lunch", "15 min deep breathing").
 *           maxLength: 500
 *           nullable: true
 *           example: 30-minute strength training session
 *         intensity:
 *           type: string
 *           enum: [low, medium, high]
 *           description: Optional intensity level (e.g., for exercise).
 *           nullable: true
 *           example: medium
 *         moodBefore:
 *           type: string
 *           enum: [stressed, neutral, happy, tired, motivated, anxious]
 *           description: User's mood before the activity (for tracking impact).
 *           nullable: true
 *           example: stressed
 *         moodAfter:
 *           type: string
 *           enum: [stressed, neutral, happy, tired, motivated, anxious]
 *           description: User's mood after the activity (for tracking impact).
 *           nullable: true
 *           example: motivated
 *         caloriesConsumed:
 *           type: number
 *           minimum: 0
 *           description: For meal types, estimated calories consumed.
 *           nullable: true
 *           example: 650
 *         waterAmountMl:
 *           type: number
 *           minimum: 0
 *           description: For water_intake, amount in milliliters.
 *           nullable: true
 *           example: 500
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the record was created.
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the record was last updated.
 *           readOnly: true
 */
const wellnessRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['break', 'meal', 'exercise', 'mindfulness', 'sleep', 'water_intake', 'custom'],
      required: [true, 'Please specify the wellness activity type'],
    },
    date: {
      type: Date,
      required: [true, 'Please provide the date and time of the activity'],
    },
    durationMinutes: {
      type: Number,
      min: [1, 'Duration must be at least 1 minute'],
    },
    details: {
      type: String,
      trim: true,
      maxlength: [500, 'Details cannot exceed 500 characters'],
    },
    intensity: {
      type: String,
      enum: ['low', 'medium', 'high'],
    },
    moodBefore: {
      type: String,
      enum: ['stressed', 'neutral', 'happy', 'tired', 'motivated', 'anxious'],
    },
    moodAfter: {
      type: String,
      enum: ['stressed', 'neutral', 'happy', 'tired', 'motivated', 'anxious'],
    },
    caloriesConsumed: {
        type: Number,
        min: 0,
    },
    waterAmountMl: {
        type: Number,
        min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('WellnessRecord', wellnessRecordSchema);