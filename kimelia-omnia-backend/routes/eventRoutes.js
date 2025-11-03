const express = require('express');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const {
    // validateId is REMOVED here from import
    validateCreateEvent,
    validateUpdateEvent
} = require('../middleware/validationMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Events (Omnia Planner)
 *   description: API for managing user calendar events, part of the Omnia Planner module.
 */

// Apply protect middleware to all event routes
router.use(protect);

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Retrieve all events for the authenticated user.
 *     description: Fetches a list of all calendar events belonging to the current user. Supports filtering by date range.
 *     tags: [Events (Omnia Planner)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         required: false
 *         description: Optional. Start date (ISO 8601) to filter events occurring after or on this date.
 *         example: 2024-11-01T00:00:00.000Z
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         required: false
 *         description: Optional. End date (ISO 8601) to filter events occurring before or on this date.
 *         example: 2024-11-30T23:59:59.000Z
 *     responses:
 *       200:
 *         description: A list of events.
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
 *                     $ref: '#/components/schemas/Event'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     summary: Create a new event for the authenticated user.
 *     description: Adds a new calendar event to the user's Omnia Planner. The `user` field is automatically set based on the authenticated user.
 *     tags: [Events (Omnia Planner)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, startTime, endTime]
 *             properties:
 *               title: { type: string, minLength: 3, maxLength: 200, example: "Project Planning" }
 *               description: { type: string, maxLength: 1000, example: "Align on next steps for Q1 initiative." }
 *               location: { type: string, maxLength: 200, example: "Google Meet" }
 *               startTime: { type: string, format: "date-time", example: "2024-11-20T14:00:00.000Z" }
 *               endTime: { type: string, format: "date-time", example: "2024-11-20T15:00:00.000Z" }
 *               allDay: { type: boolean, example: false }
 *               category: { type: string, enum: [meeting, appointment, personal, study, workout, other], example: "meeting" }
 *               attendees: { type: array, items: { type: string, format: "email" }, example: ["team.member@example.com"] }
 *               reminders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     time: { type: string, format: "date-time", example: "2024-11-20T13:45:00.000Z" }
 *                     method: { type: string, enum: [email, app_notification, sms], example: "app_notification" }
 *     responses:
 *       201:
 *         description: Event created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Event created successfully!" }
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.route('/')
    .get(getEvents)
    .post(validateCreateEvent, createEvent);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Retrieve a single event by its ID.
 *     description: Fetches details of a specific event. The event must belong to the authenticated user.
 *     tags: [Events (Omnia Planner)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the event to retrieve.
 *         example: 60d0fe4f5b5f7e001c0d3a7f
 *     responses:
 *       200:
 *         description: Event details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     summary: Update an existing event.
 *     description: Modifies details of an existing event. Only the event's owner can update it.
 *     tags: [Events (Omnia Planner)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the event to update.
 *         example: 60d0fe4f5b5f7e001c0d3a7f
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string, minLength: 3, maxLength: 200, example: "Updated Project Sync" }
 *               description: { type: string, maxLength: 1000, example: "Final review and task delegation." }
 *               location: { type: string, maxLength: 200, example: "Microsoft Teams" }
 *               startTime: { type: string, format: "date-time", example: "2024-11-20T14:30:00.000Z" }
 *               endTime: { type: string, format: "date-time", example: "2024-11-20T15:30:00.000Z" }
 *               allDay: { type: boolean, example: false }
 *               category: { type: string, enum: [meeting, appointment, personal, study, workout, other], example: "appointment" }
 *               attendees: { type: array, items: { type: string, format: "email" }, example: ["manager@example.com"] }
 *               reminders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     time: { type: string, format: "date-time", example: "2024-11-20T14:15:00.000Z" }
 *                     method: { type: string, enum: [email, app_notification, sms], example: "email" }
 *     responses:
 *       200:
 *         description: Event updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Event updated successfully!" }
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     summary: Delete an event.
 *     description: Removes a calendar event from the user's planner. Only the event's owner can delete it.
 *     tags: [Events (Omnia Planner)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the event to delete.
 *         example: 60d0fe4f5b5f7e001c0d3a7f
 *     responses:
 *       200:
 *         description: Event deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Event deleted successfully!" }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.route('/:id')
    // REMOVED .all() debugging middleware
    .get(getEvent) // validateId is removed
    .put(validateUpdateEvent, updateEvent) // validateId is removed
    .delete(deleteEvent); // validateId is removed

module.exports = router;