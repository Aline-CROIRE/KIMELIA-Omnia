
const express = require('express');
const {
  getProductivitySummary,
  getSpendingSummary,
  getAIPersonalityRecommendation,
  getAIGoalRecommendation,
} = require('../controllers/insightController');
const { protect } = require('../middleware/authMiddleware');
const {
  validateIdParam // --- ADDED: Import validateIdParam for goalId ---
} = require('../middleware/validationMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Insights (Omnia Insights)
 *   description: API for generating analytics reports and AI-driven recommendations.
 */

// Apply protect middleware to all insight routes
router.use(protect);

/**
 * @swagger
 * /insights/productivity-summary:
 *   get:
 *     summary: Get a productivity summary report for the authenticated user.
 *     description: Provides an overview of tasks, events, and goals for a specified period.
 *     tags: [Insights (Omnia Insights)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: week
 *         required: false
 *         description: Optional. The time period for the summary.
 *         example: month
 *     responses:
 *       200:
 *         description: Productivity summary report retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     period: { type: string, example: "week" }
 *                     startDate: { type: string, format: "date-time", example: "2024-11-17T00:00:00.000Z" }
 *                     endDate: { type: string, format: "date-time", example: "2024-11-23T23:59:59.999Z" }
 *                     tasks:
 *                       type: object
 *                       properties:
 *                         total: { type: number, example: 10 }
 *                         completed: { type: number, example: 7 }
 *                         inProgress: { type: number, example: 3 }
 *                         completionRate: { type: string, example: "70.00" }
 *                     events:
 *                       type: object
 *                       properties:
 *                         upcoming: { type: number, example: 5 }
 *                     goals:
 *                       type: object
 *                       properties:
 *                         active: { type: number, example: 3 }
 *                         overdue: { type: number, example: 1 }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/insights/productivity-summary', getProductivitySummary);

/**
 * @swagger
 * /insights/spending-summary:
 *   get:
 *     summary: Get a spending summary report by category for the authenticated user.
 *     description: Provides an aggregated overview of expenses grouped by category for a specified period.
 *     tags: [Insights (Omnia Insights)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: month
 *         required: false
 *         description: Optional. The time period for the summary.
 *         example: month
 *     responses:
 *       200:
 *         description: Spending summary report retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     period: { type: string, example: "month" }
 *                     startDate: { type: string, format: "date-time", example: "2024-11-01T00:00:00.000Z" }
 *                     endDate: { type: string, format: "date-time", example: "2024-11-30T23:59:59.999Z" }
 *                     totalOverallSpent: { type: number, format: float, example: 850.75 }
 *                     spendingByCategory:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category: { type: string, example: "food" }
 *                           totalSpent: { type: number, format: float, example: 320.50 }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/insights/spending-summary', getSpendingSummary);

/**
 * @swagger
 * /insights/ai-productivity-recommendations:
 *   post:
 *     summary: Get AI-driven productivity recommendations for the authenticated user.
 *     description: Leverages AI to provide personalized suggestions for improving productivity based on the user's activity.
 *     tags: [Insights (Omnia Insights)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               period:
 *                 type: string
 *                 enum: [day, week, month, year]
 *                 default: week
 *                 description: Optional. The period to summarize user activity for AI analysis.
 *                 example: week
 *               customContext:
 *                 type: string
 *                 description: Optional. Additional custom text context for the AI (e.g., "I feel overwhelmed with too many meetings").
 *                 example: "I am struggling to start my high-priority tasks."
 *     responses:
 *       200:
 *         description: AI productivity recommendations generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "AI productivity recommendations generated." }
 *                 data:
 *                   type: object
 *                   properties:
 *                     recommendation: { type: string, example: "Based on your recent tasks, consider dedicating 30 minutes each morning to your highest priority task before checking emails. This 'deep work' block can significantly boost your progress." }
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/insights/ai-productivity-recommendations', getAIPersonalityRecommendation);

/**
 * @swagger
 * /insights/ai-goal-recommendations/{goalId}:
 *   post:
 *     summary: Get AI-driven recommendations for achieving a specific goal.
 *     description: Uses AI to provide tailored advice and strategies to help the user progress towards a particular goal.
 *     tags: [Insights (Omnia Insights)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the goal for which to generate recommendations.
 *         example: 60d0fe4f5b5f7e001c0d3a81
 *     responses:
 *       200:
 *         description: AI recommendations for the goal generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "AI recommendations for goal 'Learn Node.js backend development' generated." }
 *                 data:
 *                   type: object
 *                   properties:
 *                     recommendation: { type: string, example: "To master Node.js, break it down into smaller weekly sprints: Week 1: Express.js, Week 2: MongoDB Integration, etc. Dedicate at least 1 hour daily and build a small project for each new concept." }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/insights/ai-goal-recommendations/:goalId', validateIdParam, getAIGoalRecommendation); // --- ADDED validateIdParam ---

module.exports = router;
