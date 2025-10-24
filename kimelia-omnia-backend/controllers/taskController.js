const asyncHandler = require('../utils/asyncHandler');
const Task = require('../models/Task');
const User = require('../models/User'); // For potential user validation/population

// @desc    Get all tasks for the authenticated user
// @route   GET /api/v1/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  // Find tasks belonging to the authenticated user
  const tasks = await Task.find({ user: req.user._id }).sort({ dueDate: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks,
  });
});

// @desc    Get a single task by ID for the authenticated user
// @route   GET /api/v1/tasks/:id
// @access  Private
const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found.');
  }

  // Ensure the task belongs to the authenticated user
  if (task.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to access this task.');
  }

  res.status(200).json({
    success: true,
    data: task,
  });
});

// @desc    Create a new task
// @route   POST /api/v1/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  // Ensure the task is associated with the authenticated user
  req.body.user = req.user._id;

  // Basic validation for required fields
  if (!req.body.title || !req.body.status || !req.body.priority) {
      res.status(400);
      throw new Error('Please provide at least a title, status, and priority for the task.');
  }

  const task = await Task.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Task created successfully!',
    data: task,
  });
});

// @desc    Update an existing task
// @route   PUT /api/v1/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  let task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found.');
  }

  // Ensure the task belongs to the authenticated user
  if (task.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this task.');
  }

  // Prevent user from changing the 'user' field
  delete req.body.user;

  task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // Return the updated document
    runValidators: true, // Run Mongoose validators on update
  });

  res.status(200).json({
    success: true,
    message: 'Task updated successfully!',
    data: task,
  });
});

// @desc    Delete an existing task
// @route   DELETE /api/v1/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new new Error('Task not found.');
  }

  // Ensure the task belongs to the authenticated user
  if (task.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this task.');
  }

  await task.deleteOne(); // Use deleteOne() for Mongoose 6+

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully!',
  });
});

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
};