const express = require('express');
const {
  getLearningResources,
  getLearningResource,
  createLearningResource,
  updateLearningResource,
  deleteLearningResource,
  getMotivationalTipController,
  aiGenerateLearningResources, // --- UPDATED: Import new controller ---
} = require('../controllers/learningResourceController');
const { protect } = require('../middleware/authMiddleware');
const {
    validateCreateLearningResource,
    validateUpdateLearningResource,
    validateIdParam,
    validateAiGenerateLearningResource, // --- UPDATED: Import new validator ---
} = require('../middleware/validationMiddleware');

const router = express.Router();

// Apply protect middleware to all learning resource routes
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Learning Resources (Omnia Coach)
 *   description: API for managing user's learning materials and fetching motivational tips.
 */

// --- EXPLICITLY DEFINE THE BASE /learning-resources ROUTES FIRST ---

/**
 * @swagger
 * /learning-resources:
 *   get:
 *     summary: Retrieve all learning resources for the authenticated user.
 *     description: Fetches a list of all learning resources belonging to the current user. Supports filtering and search.
 *     tags: [Learning Resources (Omnia Coach)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [article, video, course, book, podcast, tool, other] }
 *         description: Optional. Filter resources by type.
 *       - in: query
 *         name: category
 *         schema: { type: string, enum: [programming, marketing, finance, design, self-improvement, other] }
 *         description: Optional. Filter resources by category.
 *       - in: query
 *         name: tag
 *         schema: { type: string }
 *         description: Optional. Filter resources by a specific tag.
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Optional. Search for text in resource title or description.
 *       - in: query
 *         name: relatedGoal
 *         schema: { type: string }
 *         description: Optional. Filter resources related to a specific goal ID.
 *     responses:
 *       200:
 *         description: A list of learning resources.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 count: { type: number, example: 2 }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/LearningResource' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       500: { $ref: '#/components/responses/ServerError' }
 *   post:
 *     summary: Create a new learning resource for the authenticated user.
 *     description: Adds a new learning resource. The `user` field is automatically set.
 *     tags: [Learning Resources (Omnia Coach)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LearningResource'
 *             properties:
 *               _id: { readOnly: false }
 *               user: { readOnly: false }
 *     responses:
 *       201:
 *         description: Resource created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Learning resource created successfully!" }
 *                 data: { $ref: '#/components/schemas/LearningResource' }
 *       400: { $ref: '#/components/responses/BadRequestError' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get('/', getLearningResources); // Handles GET /api/v1/learning-resources
router.post('/', validateCreateLearningResource, createLearningResource); // Handles POST /api/v1/learning-resources


// --- Route for AI Generation (Specific Sub-Path) ---
/**
 * @swagger
 * /learning-resources/ai-generate:
 *   post:
 *     summary: Generate learning resource suggestions using AI.
 *     description: Provides AI-curated learning resource titles, descriptions, and mock URLs based on a specified topic, type hint, and difficulty.
 *     tags: [Learning Resources (Omnia Coach)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topic
 *             properties:
 *               topic:
 *                 type: string
 *                 description: The topic or goal for which to generate learning resources.
 *                 minLength: 10
 *                 example: "Advanced React Hooks"
 *               typeHint:
 *                 type: string
 *                 enum: [articles, videos, courses, books, podcasts, tools, any]
 *                 description: Optional. A hint for the type of resources to generate.
 *                 example: "videos"
 *               difficulty:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced, expert]
 *                 description: Optional. The desired difficulty level for the resources.
 *                 example: "intermediate"
 *               relatedGoal:
 *                 type: string
 *                 description: Optional ID of a goal to associate these generated resources with.
 *                 example: "60d0fe4f5b5f7e001c0d3a81"
 *     responses:
 *       200:
 *         description: AI generated resource suggestions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "AI generated learning resource suggestions." }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title: { type: string, example: "Mastering the useState Hook" }
 *                       description: { type: string, example: "A deep dive into useState, covering best practices and common pitfalls." }
 *                       url: { type: string, format: url, example: "https://react.dev/learn/understanding-your-ui#usestate" }
 *                       type: { type: string, example: "article" }
 *                       category: { type: string, example: "programming" }
 *                       source: { type: string, example: "AI_suggested" }
 *       400: { $ref: '#/components/responses/BadRequestError' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.post('/ai-generate', validateAiGenerateLearningResource, aiGenerateLearningResources); // --- NEW AI GENERATION ROUTE ---


// --- Then, define the route for a SINGLE resource WITH an ID ---

/**
 * @swagger
 * /learning-resources/{id}:
 *   get:
 *     summary: Retrieve a single learning resource by its ID.
 *     description: Fetches details of a specific learning resource.
 *     tags: [Learning Resources (Omnia Coach)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: The ID of the resource to retrieve.
 *         example: 60d0fe4f5b5f7e001c0d3a82
 *     responses:
 *       200:
 *         description: Resource details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/LearningResource' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/ServerError' }
 *   put:
 *     summary: Update an existing learning resource.
 *     description: Modifies details of an existing learning resource.
 *     tags: [Learning Resources (Omnia Coach)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: The ID of the resource to update.
 *         example: 60d0fe4f5b5f7e001c0d3a82
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LearningResource'
 *             properties:
 *               _id: { readOnly: false }
 *               user: { readOnly: false }
 *     responses:
 *       200:
 *         description: Resource updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Learning resource updated successfully!" }
 *                 data: { $ref: '#/components/schemas/LearningResource' }
 *       400: { $ref: '#/components/responses/BadRequestError' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       500: { $ref: '#/components/responses/ServerError' }
 *   delete:
 *     summary: Delete a learning resource.
 *     description: Removes a learning resource.
 *     tags: [Learning Resources (Omnia Coach)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: The ID of the resource to delete.
 *         example: 60d0fe4f5b5f7e001c0d3a82
 *     responses:
 *       200:
 *         description: Resource deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Learning resource deleted successfully!" }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get('/:id', validateIdParam, getLearningResource);
router.put('/:id', validateIdParam, validateUpdateLearningResource, updateLearningResource);
router.delete('/:id', validateIdParam, deleteLearningResource);

// This route uses a different path segment, so it won't conflict directly.
router.get('/coach/motivational-tip', getMotivationalTipController);

module.exports = router;