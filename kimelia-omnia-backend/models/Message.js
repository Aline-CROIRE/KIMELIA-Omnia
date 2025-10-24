const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       required:
 *         - user
 *         - type
 *         - content
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated unique ID of the smart communication entry.
 *           readOnly: true
 *           example: 60d0fe4f5b5f7e001c0d3a80
 *         user:
 *           type: string
 *           description: The ID of the user to whom this message entry belongs.
 *           readOnly: true
 *           example: 60d0fe4f5b5f7e001c0d3a7b
 *         type:
 *           type: string
 *           enum: [email_summary, draft, note, reminder, communication_log]
 *           description: The type of communication entry (e.g., AI-generated summary of an email, a draft, a personal note).
 *           example: email_summary
 *         subject:
 *           type: string
 *           description: Subject line, especially relevant for email summaries or drafts.
 *           nullable: true
 *           minLength: 3
 *           maxLength: 500
 *           example: Summary of Team Meeting with John Doe
 *         content:
 *           type: string
 *           description: The actual text content (e.g., email summary, drafted message, note).
 *           minLength: 10
 *           maxLength: 5000
 *           example: Key points discussed were Q1 targets, new marketing strategy, and next steps for product launch. Action items for John.
 *         source:
 *           type: string
 *           enum: [manual, AI_generated, gmail, slack, other]
 *           default: manual
 *           description: How this message entry was created or its origin.
 *           example: AI_generated
 *         externalReferenceId:
 *           type: string
 *           description: Optional ID to link to an external system (e.g., Gmail thread ID, Slack message ID).
 *           nullable: true
 *           example: '178f24b0c2e3d4f5'
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Optional tags for categorization (e.g., client, project, follow-up).
 *           example: [client-X, follow-up]
 *         status:
 *           type: string
 *           enum: [read, unread, archived, deleted, pending_send, sent]
 *           default: unread
 *           description: The current status of the message entry.
 *           example: unread
 *         scheduledSendTime:
 *           type: string
 *           format: date-time
 *           description: If this is a draft, the scheduled time for it to be sent.
 *           nullable: true
 *           example: 2024-11-25T09:00:00.000Z
 *         relatedTask:
 *           type: string
 *           description: Optional ID of a related task in Omnia Planner. (References Task Model)
 *           nullable: true
 *           example: 60d0fe4f5b5f7e001c0d3a7c
 *         relatedEvent:
 *           type: string
 *           description: Optional ID of a related event in Omnia Planner. (References Event Model)
 *           nullable: true
 *           example: 60d0fe4f5b5f7e001c0d3a7f
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the message entry was created.
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the message entry was last updated.
 *           readOnly: true
 */
const messageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['email_summary', 'draft', 'note', 'reminder', 'communication_log'],
      required: [true, 'Please specify the message type'],
    },
    subject: {
      type: String,
      trim: true,
      minlength: [3, 'Subject must be at least 3 characters'],
      maxlength: [500, 'Subject cannot exceed 500 characters'],
    },
    content: {
      type: String,
      required: [true, 'Please provide content for the message entry'],
      trim: true,
      minlength: [10, 'Content must be at least 10 characters'],
      maxlength: [5000, 'Content cannot exceed 5000 characters'],
    },
    source: {
        type: String,
        enum: ['manual', 'AI_generated', 'gmail', 'slack', 'other'],
        default: 'manual',
    },
    externalReferenceId: {
        type: String, // e.g., thread ID from an external email system
        trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ['read', 'unread', 'archived', 'deleted', 'pending_send', 'sent'],
      default: 'unread',
    },
    scheduledSendTime: {
        type: Date, // If it's a draft scheduled to be sent
    },
    relatedTask: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
    },
    relatedEvent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Message', messageSchema);