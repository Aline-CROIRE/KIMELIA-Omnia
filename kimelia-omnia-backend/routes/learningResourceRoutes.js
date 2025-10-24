const express = require('express');
const {
  getLearningResources,
  getLearningResource,
  createLearningResource,
  updateLearningResource,
  deleteLearningResource,
  getMotivationalTipController, // Import the motivational tip controller
} = require('../controllers/learningResourceController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Learning Resources (Omnia Coach)
 *   description: API for managing user's learning materials and fetching motivational tips.
 */

// Apply protect middleware to all routes in this file
router.use(protect);

/**
 * @swagger
 * /learning-resources:
 *   get:
 *     summary: Retrieve all learning resources for the authenticated user.
 *     description: Fetches a list of all learning resources (articles, videos, courses) belonging to the current user. Supports filtering by type, category, tag, related goal, and text search.
 *     tags: [Learning Resources (Omnia Coach)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [article, video, course, book, podcast, tool, other]
 *         required: false
 *         description: Optional. Filter resources by their type.
 *         example: video
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [programming, marketing, finance, design, self-improvement, other]
 *         required: false
 *         description: Optional. Filter resources by their category.
 *         example: programming
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         required: false
 *         description: Optional. Filter resources by a specific tag.
 *         example: frontend
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Optional. Search for text in resource title or description.
 *         example: "React tutorial"
 *       - in: query
 *         name: relatedGoal
 *         schema:
 *           type: string
 *         required: false
 *         description: Optional. Filter resources related to a specific goal ID.
 *         example: 60d0fe4f5b5f7e001c0d3a81
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
 *                   items:
 *                     $ref: '#/components/schemas/LearningResource'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     summary: Create a new learning resource for the authenticated user.
 *     description: Adds a new learning resource to the user's Omnia Coach. The `user` field is automatically set.
 *     tags: [Learning Resources (Omnia Coach)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, url, type]
 *             properties:
 *               title: { type: string, minLength: 5, maxLength: 300, example: "Advanced CSS Grid Layout" }
 *               description: { type: string, maxLength: 1000, example: "A comprehensive guide to mastering CSS Grid for responsive design." }
 *               url: { type: string, format: "url", example: "https://css-tricks.com/snippets/css/a-guide-to-css-grid/" }
 *               type: { type: string, enum: [article, video, course, book, podcast, tool, other], example: "article" }
 *               category: { type: string, enum: [programming, marketing, finance, design, self-improvement, other], example: "design" }
 *               tags: { type: array, items: { type: string }, example: ["css", "frontend", "responsive"] }
 *               relatedGoal: { type: string, example: "60d0fe4f5b5f7e001c0d3a81" }
 *               source: { type: string, enum: [manual, AI_suggested, web_scrape, imported], example: "manual" }
 *     responses:
 *       201:
 *         description: Learning resource created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Learning resource created successfully!" }
 *                 data:
 *                   $ref: '#/components/schemas/LearningResource'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.route('/').get(getLearningResources).post(createLearningResource);

/**
 * @swagger
 * /learning-resources/{id}:
 *   get:
 *     summary: Retrieve a single learning resource by its ID.
 *     description: Fetches details of a specific learning resource. The resource must belong to the authenticated user.
 *     tags: [Learning Resources (Omnia Coach)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the learning resource to retrieve.
 *         example: 60d0fe4f5b5f7e001c0d3a82
 *     responses:
 *       200:
 *         description: Learning resource details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/LearningResource'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     summary: Update an existing learning resource.
 *     description: Modifies details of an existing learning resource. Only the owner can update it.
 *     tags: [Learning Resources (Omnia Coach)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the learning resource to update.
 *         example: 60d0fe4f5b5f7e001c0d3a82
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string, minLength: 5, maxLength: 300, example: "Mastering CSS Grid Layout (Updated)" }
 *               description: { type: string, maxLength: 1000, example: "Updated guide with new responsive patterns." }
 *               url: { type: string, format: "url", example: "https://updated-css-tricks.com/grid" }
 *               type: { type: string, enum: [article, video, course, book, podcast, tool, other], example: "video" }
 *               category: { type: string, enum: [programming, marketing, finance, design, self-improvement, other], example: "programming" }
 *               tags: { type: array, items: { type: string }, example: ["css", "advanced", "tutorial"] }
 *               relatedGoal: { type: string, example: "60d0fe4f5b5f7e001c0d3a81" }
 *               source: { type: string, enum: [manual, AI_suggested, web_scrape, imported], example: "manual" }
 *     responses:
 *       200:
 *         description: Learning resource updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Learning resource updated successfully!" }
 *                 data:
 *                   $ref: '#/components/schemas/LearningResource'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     summary: Delete a learning resource.
 *     description: Removes a learning resource from the user's Omnia Coach. Only the owner can delete it.
 *     tags: [Learning Resources (Omnia Coach)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the learning resource to delete.
 *         example: 60d0fe4f5b5f7e001c0d3a82
 *     responses:
 *       200:
 *         description: Learning resource deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Learning resource deleted successfully!" }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.route('/:id').get(getLearningResource).put(updateLearningResource).delete(deleteLearningResource);

/**
 * @swagger
 * /coach/motivational-tip:
 *   get:
 *     summary: Get a motivational tip.
 *     description: Retrieves a motivational tip to inspire and encourage users. Future versions may provide AI-generated, personalized tips.
 *     tags: [Learning Resources (Omnia Coach)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A motivational tip retrieved successfully.
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/coach/motivational-tip', getMotivationalTipController);

module.exports = router;