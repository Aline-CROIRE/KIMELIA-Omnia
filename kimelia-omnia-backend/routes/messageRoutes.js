const express = require('express');
const {
  getMessages,
  getMessage,
  createMessage,
  updateMessage,
  deleteMessage,
  summarizeContent,
  generateDraft,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Smart Communication (Omnia Communicator)
 *   description: API for managing AI-summarized emails, drafts, communication notes, and AI content generation.
 */

// Apply protect middleware to all message routes
router.use(protect);

/**
 * @swagger
 * /messages:
 *   get:
 *     summary: Retrieve all smart communication entries for the authenticated user.
 *     description: Fetches a list of all communication entries (email summaries, drafts, notes) belonging to the current user. Supports filtering and searching.
 *     tags: [Smart Communication (Omnia Communicator)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [email_summary, draft, note, reminder, communication_log]
 *         required: false
 *         description: Optional. Filter messages by their type.
 *         example: email_summary
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [read, unread, archived, deleted, pending_send, sent]
 *         required: false
 *         description: Optional. Filter messages by their status.
 *         example: unread
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         required: false
 *         description: Optional. Filter messages by a specific tag.
 *         example: client-X
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Optional. Search for text in message subject or content.
 *         example: "meeting summary"
 *     responses:
 *       200:
 *         description: A list of smart communication entries.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 count: { type: number, example: 2 }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     summary: Create a new smart communication entry for the authenticated user.
 *     description: Adds a new smart communication entry (e.g., AI summary, draft, note) to the user's Omnia Communicator. The `user` field is automatically set.
 *     tags: [Smart Communication (Omnia Communicator)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, content]
 *             properties:
 *               type: { type: string, enum: [email_summary, draft, note, reminder, communication_log], example: "email_summary" }
 *               subject: { type: string, minLength: 3, maxLength: 500, example: "Meeting with Project Alpha" }
 *               content: { type: string, minLength: 10, maxLength: 5000, example: "Discussed deliverables for next sprint. John to lead." }
 *               source: { type: string, enum: [manual, AI_generated, gmail, slack, other], example: "AI_generated" }
 *               externalReferenceId: { type: string, example: "some_gmail_thread_id" }
 *               tags: { type: array, items: { type: string }, example: ["project-alpha", "internal"] }
 *               status: { type: string, enum: [read, unread, archived, deleted, pending_send, sent], example: "unread" }
 *               scheduledSendTime: { type: string, format: "date-time", example: "2024-11-25T09:00:00.000Z" }
 *               relatedTask: { type: string, example: "60d0fe4f5b5f7e001c0d3a7c" }
 *               relatedEvent: { type: string, example: "60d0fe4f5b5f7e001c0d3a7f" }
 *     responses:
 *       201:
 *         description: Communication entry created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Communication entry created successfully!" }
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.route('/').get(getMessages).post(createMessage);

/**
 * @swagger
 * /messages/{id}:
 *   get:
 *     summary: Retrieve a single smart communication entry by its ID.
 *     description: Fetches details of a specific communication entry. The entry must belong to the authenticated user.
 *     tags: [Smart Communication (Omnia Communicator)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the communication entry to retrieve.
 *         example: 60d0fe4f5b5f7e001c0d3a80
 *     responses:
 *       200:
 *         description: Communication entry details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     summary: Update an existing smart communication entry.
 *     description: Modifies details of an existing communication entry. Only the owner can update it.
 *     tags: [Smart Communication (Omnia Communicator)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the communication entry to update.
 *         example: 60d0fe4f5b5f7e001c0d3a80
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type: { type: string, enum: [email_summary, draft, note, reminder, communication_log], example: "note" }
 *               subject: { type: string, minLength: 3, maxLength: 500, example: "Updated note for Project Alpha" }
 *               content: { type: string, minLength: 10, maxLength: 5000, example: "Important: Contact sales for new leads by end of day." }
 *               source: { type: string, enum: [manual, AI_generated, gmail, slack, other], example: "manual" }
 *               externalReferenceId: { type: string, example: "new_ref_id" }
 *               tags: { type: array, items: { type: string }, example: ["urgent", "sales"] }
 *               status: { type: string, enum: [read, unread, archived, deleted, pending_send, sent], example: "read" }
 *               scheduledSendTime: { type: string, format: "date-time", example: "2024-11-26T10:00:00.000Z" }
 *               relatedTask: { type: string, example: "60d0fe4f5b5f7e001c0d3a7c" }
 *               relatedEvent: { type: string, example: "60d0fe4f5b5f7e001c0d3a7f" }
 *     responses:
 *       200:
 *         description: Communication entry updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Communication entry updated successfully!" }
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     summary: Delete a smart communication entry.
 *     description: Removes a communication entry from the user's Omnia Communicator. Only the owner can delete it.
 *     tags: [Smart Communication (Omnia Communicator)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the communication entry to delete.
 *         example: 60d0fe4f5b5f7e001c0d3a80
 *     responses:
 *       200:
 *         description: Communication entry deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Communication entry deleted successfully!" }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.route('/:id').get(getMessage).put(updateMessage).delete(deleteMessage);

/**
 * @swagger
 * /messages/ai/summarize:
 *   post:
 *     summary: Summarize text content using AI.
 *     description: Sends a block of text to the AI engine to generate a concise summary.
 *     tags: [Smart Communication (Omnia Communicator)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *                 minLength: 50
 *                 maxLength: 10000
 *                 description: The text content to be summarized.
 *                 example: "KIMELIA Omnia is an AI-driven productivity and personal management platform... (a long paragraph of text here)."
 *               promptPrefix:
 *                 type: string
 *                 description: Optional custom instruction for the AI before the text.
 *                 example: "Extract the key benefits for startups from the following text:"
 *     responses:
 *       200:
 *         description: Content summarized successfully by AI.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Content summarized by AI." }
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary: { type: string, example: "KIMELIA Omnia is an AI platform offering productivity solutions for individuals, students, startups, and businesses, centralizing tools and automating tasks to optimize life and work." }
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/ai/summarize', protect, summarizeContent); // Added protect middleware

/**
 * @swagger
 * /messages/ai/draft:
 *   post:
 *     summary: Generate a message draft using AI.
 *     description: Uses the AI engine to draft an email or message based on user instructions and optional context.
 *     tags: [Smart Communication (Omnia Communicator)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [instruction]
 *             properties:
 *               instruction:
 *                 type: string
 *                 minLength: 20
 *                 maxLength: 2000
 *                 description: Clear instructions for the AI on what to draft.
 *                 example: "Draft an email to client X, thanking them for the meeting and confirming the next steps discussed. Mention deadline of end of month for deliverable A."
 *               context:
 *                 type: string
 *                 description: Optional additional context for the AI (e.g., previous email, meeting notes).
 *                 example: "Meeting notes: Client X interested in new proposal. Deliverable A due Nov 30."
 *               tone:
 *                 type: string
 *                 enum: [professional, friendly, urgent, formal, casual]
 *                 default: professional
 *                 description: The desired tone for the draft.
 *                 example: professional
 *               format:
 *                 type: string
 *                 enum: [email, slack_message, formal_letter, memo]
 *                 default: email
 *                 description: The desired format for the draft.
 *                 example: email
 *     responses:
 *       200:
 *         description: Message draft generated successfully by AI.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Message draft generated by AI." }
 *                 data:
 *                   type: object
 *                   properties:
 *                     draft: { type: string, example: "Subject: Following Up on Our Meeting - Project Y\n\nDear Client X,\n\nThank you for meeting with us today. We appreciate your time and interest in Project Y. This email confirms the next steps we discussed:\n\n1. You will provide us with the required documents by [Date].\n2. We will finalize the proposal by [Date].\n\nWe look forward to moving forward with Project Y. Please let us know if you have any questions.\n\nBest regards,\n[Your Name]" }
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/ai/draft', protect, generateDraft); // Added protect middleware


module.exports = router;