
const express = require('express');
const {
  getLearningResources,
  getLearningResource,
  createLearningResource,
  updateLearningResource,
  deleteLearningResource,
  getMotivationalTipController,
} = require('../controllers/learningResourceController');
const { protect } = require('../middleware/authMiddleware');
const {
    validateCreateLearningResource,
    validateUpdateLearningResource,
    validateIdParam // --- ADDED: Import validateIdParam ---
} = require('../middleware/validationMiddleware'); // Path to your validation middleware

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Learning Resources (Omnia Coach)
 *   description: API for managing user's learning materials and fetching motivational tips.
 */

// Apply protect middleware to all learning resource routes
router.use(protect);

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
router.route('/')
    .get(getLearningResources)
    .post(validateCreateLearningResource, createLearningResource);

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
 *       404: { $ref: '#/components/responses/NotFoundError' }
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
router.route('/:id')
    .get(validateIdParam, getLearningResource) // --- ADDED validateIdParam ---
    .put(validateIdParam, validateUpdateLearningResource, updateLearningResource) // --- ADDED validateIdParam ---
    .delete(validateIdParam, deleteLearningResource); // --- ADDED validateIdParam ---

/**
 * @swagger
 * /coach/motivational-tip:
 *   get:
 *     summary: Get a motivational tip.
 *     description: Fetches a motivational tip, potentially personalized.
 *     tags: [Learning Resources (Omnia Coach)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A motivational tip.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     tip: { type: string, example: "Believe you can and you're halfway there." }
 *                     source: { type: string, example: "Omnia Coach" }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.route('/coach/motivational-tip')
    .get(getMotivationalTipController);

module.exports = router;
