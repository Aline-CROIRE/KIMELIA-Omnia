

const asyncHandler = require('../utils/asyncHandler');
const Task = require('../models/Task');
const Project = require('../models/Project'); // Import Project model

// @desc    Get all tasks for the authenticated user (optionally filtered by project)
// @route   GET /api/v1/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  const { status, priority, tag, search, projectId } = req.query;
  const query = { user: req.user._id };

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (tag) query.tags = { $in: [tag] };
  if (projectId) query.project = projectId; // Filter by project ID
  if (search) {
      query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
      ];
  }

  const tasks = await Task.find(query).sort({ dueDate: 1, createdAt: -1 });

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
  req.body.user = req.user._id;

  if (!req.body.title || !req.body.status || !req.body.priority) {
      res.status(400);
      throw new Error('Please provide at least a title, status, and priority for the task.');
  }

  // Validate if a project ID is provided and if it exists and user has access
  if (req.body.project) {
      const project = await Project.findById(req.body.project);
      if (!project) {
          res.status(404);
          throw new Error('Project not found for this task.');
      }
      // Ensure user is owner or member of the project they're linking tasks to
      const isOwner = project.owner.toString() === req.user._id.toString();
      const isMember = project.members.some(member => member.toString() === req.user._id.toString());
      if (!isOwner && !isMember) {
          res.status(401);
          throw new Error('Not authorized to link tasks to this project.');
      }
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

  if (task.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this task.');
  }

  delete req.body.user; // Prevent changing task ownership

  // Validate if a project ID is updated and if it exists and user has access
  if (req.body.project && req.body.project.toString() !== task.project?.toString()) { // Only validate if project is changing
      const project = await Project.findById(req.body.project);
      if (!project) {
          res.status(404);
          throw new Error('Project not found for this task.');
      }
      const isOwner = project.owner.toString() === req.user._id.toString();
      const isMember = project.members.some(member => member.toString() === req.user._id.toString());
      if (!isOwner && !isMember) {
          res.status(401);
          throw new Error('Not authorized to link tasks to this project.');
      }
  }


  task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
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
    throw new Error('Task not found.');
  }

  if (task.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this task.');
  }

  await task.deleteOne();

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