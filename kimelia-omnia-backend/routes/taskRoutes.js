const express = require('express');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const {
   
    validateCreateTask,
    validateUpdateTask
} = require('../middleware/validationMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tasks (Omnia Planner)
 *   description: API for managing user tasks, part of the Omnia Planner module.
 */

// Apply protect middleware to all task routes
router.use(protect);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Retrieve all tasks for the authenticated user.
 *     description: Fetches a list of all tasks belonging to the current user. Tasks can be filtered by status, priority, tags, project, or searched by keywords.
 *     tags: [Tasks (Omnia Planner)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in-progress, completed, deferred, cancelled]
 *         required: false
 *         description: Optional. Filter tasks by their status.
 *         example: in-progress
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         required: false
 *         description: Optional. Filter tasks by their priority.
 *         example: high
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         required: false
 *         description: Optional. Filter tasks by a specific tag.
 *         example: work
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Optional. Search for text in task title or description.
 *         example: "presentation"
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         required: false
 *         description: Optional. Filter tasks belonging to a specific project ID.
 *         example: 60d0fe4f5b5f7e001c0d3a83
 *     responses:
 *       200:
 *         description: A list of tasks.
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
 *                     $ref: '#/components/schemas/Task'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     summary: Create a new task for the authenticated user.
 *     description: Adds a new task entry to the user's Omnia Planner. The `user` field is automatically set based on the authenticated user. Can optionally link to a project.
 *     tags: [Tasks (Omnia Planner)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, status, priority]
 *             properties:
 *               title: { type: string, minLength: 3, maxLength: 200, example: "Finish Q3 Report" }
 *               description: { type: string, maxLength: 1000, example: "Review data, draft summary, and finalize charts." }
 *               dueDate: { type: string, format: "date-time", example: "2024-11-15T18:00:00.000Z" }
 *               status: { type: string, enum: [pending, in-progress, completed, deferred, cancelled], example: "in-progress" }
 *               priority: { type: string, enum: [low, medium, high, urgent], example: "high" }
 *               tags: { type: array, items: { type: string }, example: ["work", "reporting"] }
 *               project: { type: string, description: "Optional ID of a project to link this task to.", example: "60d0fe4f5b5f7e001c0d3a83" }
 *               reminders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     time: { type: string, format: "date-time", example: "2024-11-14T09:00:00.000Z" }
 *                     method: { type: string, enum: [email, app_notification], example: "app_notification" }
 *     responses:
 *       201:
 *         description: Task created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Task created successfully!" }
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Project not found or not authorized to link to it.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.route('/')
    .get(getTasks)
    .post(validateCreateTask, createTask);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Retrieve a single task by its ID.
 *     description: Fetches details of a specific task. The task must belong to the authenticated user.
 *     tags: [Tasks (Omnia Planner)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the task to retrieve.
 *         example: 60d0fe4f5b5f7e001c0d3a7c
 *     responses:
 *       200:
 *         description: Task details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     summary: Update an existing task.
 *     description: Modifies details of an existing task. Only the task's owner can update it. Can optionally change the linked project.
 *     tags: [Tasks (Omnia Planner)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the task to update.
 *         example: 60d0fe4f5b5f7e001c0d3a7c
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string, minLength: 3, maxLength: 200, example: "Revise Q3 Report" }
 *               description: { type: string, maxLength: 1000, example: "Add executive summary and recheck figures." }
 *               dueDate: { type: string, format: "date-time", example: "2024-11-16T10:00:00.000Z" }
 *               status: { type: string, enum: [pending, in-progress, completed, deferred, cancelled], example: "completed" }
 *               priority: { type: string, enum: [low, medium, high, urgent], example: "medium" }
 *               tags: { type: array, items: { type: string }, example: ["work", "done"] }
 *               project: { type: string, description: "Optional ID of a project to link this task to, or null to unlink.", example: "60d0fe4f5b5f7e001c0d3a83" }
 *               reminders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     time: { type: string, format: "date-time", example: "2024-11-15T09:00:00.000Z" }
 *                     method: { type: string, enum: [email, app_notification], example: "email" }
 *     responses:
 *       200:
 *         description: Task updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Task updated successfully!" }
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Task or Project not found, or not authorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     summary: Delete a task.
 *     description: Removes a task from the user's planner. Only the task's owner can delete it.
 *     tags: [Tasks (Omnia Planner)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the task to delete.
 *         example: 60d0fe4f5b5f7e001c0d3a7c
 *     responses:
 *       200:
 *         description: Task deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Task deleted successfully!" }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.route('/:id')
  
    .get(getTask) 
    .put(validateUpdateTask, updateTask) 
    .delete(deleteTask); 

module.exports = router;