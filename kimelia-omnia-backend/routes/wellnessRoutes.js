const express = require('express');
const {
  getWellnessRecords,
  getWellnessRecord,
  createWellnessRecord,
  updateWellnessRecord,
  deleteWellnessRecord,
  getWellnessSuggestionController,
} = require('../controllers/wellnessController');
const { protect } = require('../middleware/authMiddleware');
const {
    validateCreateWellnessRecord,
    validateUpdateWellnessRecord,
    validateWellnessSuggestion,
    validateIdParam // --- ADDED: Import validateIdParam ---
} = require('../middleware/validationMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Wellness (Omnia Wellness)
 *   description: API for tracking user's wellness activities and fetching AI-driven wellness suggestions.
 */

// Apply protect middleware to all wellness routes
router.use(protect);

/**
 * @swagger
 * /wellness-records:
 *   get:
 *     summary: Retrieve all wellness records for the authenticated user.
 *     description: Fetches a list of all wellness activities (breaks, meals, exercise, mindfulness, sleep, water_intake, custom) logged by the current user. Supports filtering by type and date range.
 *     tags: [Wellness (Omnia Wellness)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [break, meal, exercise, mindfulness, sleep, water_intake, custom]
 *         required: false
 *         description: Optional. Filter records by activity type.
 *         example: exercise
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         required: false
 *         description: Optional. Start date (ISO 8601) to filter records occurring after or on this date.
 *         example: 2024-11-01T00:00:00.000Z
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         required: false
 *         description: Optional. End date (ISO 8601) to filter records occurring before or on this date.
 *         example: 2024-11-30T23:59:59.999Z
 *     responses:
 *       200:
 *         description: A list of wellness records.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 count: { type: number, example: 3 }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/WellnessRecord'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     summary: Create a new wellness record for the authenticated user.
 *     description: Logs a new wellness activity. The `user` field is automatically set.
 *     tags: [Wellness (Omnia Wellness)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, date]
 *             properties:
 *               type: { type: string, enum: [break, meal, exercise, mindfulness, sleep, water_intake, custom], example: "exercise" }
 *               date: { type: string, format: "date-time", example: "2024-11-20T10:30:00.000Z" }
 *               durationMinutes: { type: number, minimum: 1, example: 45 }
 *               details: { type: string, maxLength: 500, example: "Morning jog in the park." }
 *               intensity: { type: string, enum: [low, medium, high], example: "medium" }
 *               moodBefore: { type: string, enum: [stressed, neutral, happy, tired, motivated, anxious], example: "tired" }
 *               moodAfter: { type: string, enum: [stressed, neutral, happy, tired, motivated, anxious], example: "motivated" }
 *               caloriesConsumed: { type: number, minimum: 0, example: 0 }
 *               waterAmountMl: { type: number, minimum: 0, example: 0 }
 *     responses:
 *       201:
 *         description: Wellness record created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Wellness record created successfully!" }
 *                 data:
 *                   $ref: '#/components/schemas/WellnessRecord'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.route('/wellness-records')
    .get(getWellnessRecords)
    .post(validateCreateWellnessRecord, createWellnessRecord);

/**
 * @swagger
 * /wellness-records/{id}:
 *   get:
 *     summary: Retrieve a single wellness record by its ID.
 *     description: Fetches details of a specific wellness record. The record must belong to the authenticated user.
 *     tags: [Wellness (Omnia Wellness)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the wellness record to retrieve.
 *         example: 60d0fe4f5b5f7e001c0d3a86
 *     responses:
 *       200:
 *         description: Wellness record details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/WellnessRecord'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     summary: Update an existing wellness record.
 *     description: Modifies details of an existing wellness record. Only the owner can update it.
 *     tags: [Wellness (Omnia Wellness)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the wellness record to update.
 *         example: 60d0fe4f5b5f7e001c0d3a86
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type: { type: string, enum: [break, meal, exercise, mindfulness, sleep, water_intake, custom], example: "mindfulness" }
 *               date: { type: string, format: "date-time", example: "2024-11-20T10:45:00.000Z" }
 *               durationMinutes: { type: number, minimum: 1, example: 15 }
 *               details: { type: string, maxLength: 500, example: "Guided meditation session." }
 *               intensity: { type: string, enum: [low, medium, high], example: "low" }
 *               moodBefore: { type: string, enum: [stressed, neutral, happy, tired, motivated, anxious], example: "anxious" }
 *               moodAfter: { type: string, enum: [stressed, neutral, happy, tired, motivated, anxious], example: "neutral" }
 *               caloriesConsumed: { type: number, minimum: 0, example: 0 }
 *               waterAmountMl: { type: number, minimum: 0, example: 0 }
 *     responses:
 *       200:
 *         description: Wellness record updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Wellness record updated successfully!" }
 *                 data:
 *                   $ref: '#/components/schemas/WellnessRecord'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     summary: Delete a wellness record.
 *     description: Removes a wellness record from the user's Omnia Wellness log. Only the owner can delete it.
 *     tags: [Wellness (Omnia Wellness)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the wellness record to delete.
 *         example: 60d0fe4f5b5f7e001c0d3a86
 *     responses:
 *       200:
 *         description: Wellness record deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Wellness record deleted successfully!" }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.route('/wellness-records/:id')
    .get(validateIdParam, getWellnessRecord) // --- ADDED validateIdParam ---
    .put(validateIdParam, validateUpdateWellnessRecord, updateWellnessRecord) // --- ADDED validateIdParam ---
    .delete(validateIdParam, deleteWellnessRecord); // --- ADDED validateIdParam ---

/**
 * @swagger
 * /wellness/suggest:
 *   post:
 *     summary: Get AI-driven wellness suggestions.
 *     description: Generates personalized wellness suggestions (e.g., break, meal, exercise, mindfulness) based on the user's current context and activity, leveraging AI.
 *     tags: [Wellness (Omnia Wellness)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               suggestionType:
 *                 type: string
 *                 enum: [general, break, meal, exercise, mindfulness, hydration, sleep_aid]
 *                 default: general
 *                 description: The type of wellness suggestion requested.
 *                 example: break
 *               customContext:
 *                 type: string
 *                 description: Optional. Additional custom text context for the AI (e.g., "I've been staring at the screen for hours").
 *                 example: "I just finished a high-stress meeting."
 *     responses:
 *       200:
 *         description: AI wellness suggestion generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "AI-driven break suggestion generated." }
 *                 data:
 *                   type: object
 *                   properties:
 *                     suggestion: { type: string, example: "Consider a 10-minute mindful walking break to clear your head. Focus on your breath and surroundings." }
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/wellness/suggest', validateWellnessSuggestion, getWellnessSuggestionController);

module.exports = router;