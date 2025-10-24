const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - user
 *         - title
 *         - startTime
 *         - endTime
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated unique ID of the event.
 *           readOnly: true
 *           example: 60d0fe4f5b5f7e001c0d3a7f
 *         user:
 *           type: string
 *           description: The ID of the user to whom this event belongs.
 *           readOnly: true
 *           example: 60d0fe4f5b5f7e001c0d3a7b
 *         title:
 *           type: string
 *           description: The title or brief description of the event.
 *           minLength: 3
 *           maxLength: 200
 *           example: Team Sync Meeting
 *         description:
 *           type: string
 *           description: Optional detailed description of the event.
 *           example: Discuss Q4 strategy and individual progress.
 *           nullable: true
 *         location:
 *           type: string
 *           description: The physical or virtual location of the event.
 *           example: Zoom Meeting / Conference Room A
 *           nullable: true
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: The start date and time of the event.
 *           example: 2024-11-20T10:00:00.000Z
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: The end date and time of the event.
 *           example: 2024-11-20T11:00:00.000Z
 *         allDay:
 *           type: boolean
 *           default: false
 *           description: Indicates if the event spans the entire day.
 *           example: false
 *         category:
 *           type: string
 *           enum: [meeting, appointment, personal, study, workout, other]
 *           default: meeting
 *           description: The category of the event.
 *           example: meeting
 *         attendees:
 *           type: array
 *           items:
 *             type: string
 *             format: email
 *           description: A list of email addresses of attendees for the event. (Future: link to User IDs)
 *           example: [jane.doe@example.com, alice.smith@example.com]
 *         reminders:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               time:
 *                 type: string
 *                 format: date-time
 *                 description: Time for the reminder.
 *                 example: 2024-11-20T09:45:00.000Z
 *               method:
 *                 type: string
 *                 enum: [email, app_notification, sms]
 *                 description: Method of notification.
 *                 example: app_notification
 *           description: A list of reminder objects for the event.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the event was created.
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the event was last updated.
 *           readOnly: true
 */
const eventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add an event title'],
      trim: true,
      minlength: [3, 'Event title must be at least 3 characters'],
      maxlength: [200, 'Event title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Event description cannot exceed 1000 characters'],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, 'Event location cannot exceed 200 characters'],
    },
    startTime: {
      type: Date,
      required: [true, 'Please provide a start time for the event'],
    },
    endTime: {
      type: Date,
      required: [true, 'Please provide an end time for the event'],
    },
    allDay: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: ['meeting', 'appointment', 'personal', 'study', 'workout', 'other'],
      default: 'meeting',
    },
    attendees: [
      {
        type: String, // Store as emails initially, could later link to User IDs
        match: [
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-1]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          'Please enter valid attendee email address(es)',
        ],
      },
    ],
    reminders: [
      {
        time: { type: Date, required: true },
        method: { type: String, enum: ['email', 'app_notification', 'sms'], default: 'app_notification' },
      }
    ],
  },
  {
    timestamps: true,
  }
);

// Middleware to ensure endTime is after startTime
eventSchema.pre('save', function(next) {
  if (this.startTime && this.endTime && this.startTime >= this.endTime) {
    next(new Error('End time must be after start time.'));
  } else {
    next();
  }
});

eventSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.startTime && update.endTime && update.startTime >= update.endTime) {
    next(new Error('End time must be after start time.'));
  } else if (update.startTime && !update.endTime) { // If only start time is updated, ensure it's still before original end time
      // This is more complex as it needs to access the original document.
      // For simple checks, it's often done client-side or in the controller.
      // For robust server-side, you might need to fetch the original doc first.
      next(); // Simplification for now, rely on client or more complex pre-hook.
  } else if (update.endTime && !update.startTime) { // If only end time is updated
      next();
  }
  else {
    next();
  }
});

module.exports = mongoose.model('Event', eventSchema);