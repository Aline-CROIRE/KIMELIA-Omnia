const asyncHandler = require('../utils/asyncHandler');
const Goal = require('../models/Goal');

// @desc    Get all goals for the authenticated user
// @route   GET /api/v1/goals
// @access  Private
const getGoals = asyncHandler(async (req, res) => {
  const { status, category, search } = req.query;
  const query = { user: req.user._id };

  if (status) query.status = status;
  if (category) query.category = category;
  if (search) {
      query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
      ];
  }

  const goals = await Goal.find(query).sort({ targetDate: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: goals.length,
    data: goals,
  });
});

// @desc    Get a single goal by ID for the authenticated user
// @route   GET /api/v1/goals/:id
// @access  Private
const getGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);

  if (!goal) {
    res.status(404);
    throw new Error('Goal not found.');
  }

  // Ensure the goal belongs to the authenticated user
  if (goal.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to access this goal.');
  }

  res.status(200).json({
    success: true,
    data: goal,
  });
});

// @desc    Create a new goal
// @route   POST /api/v1/goals
// @access  Private
const createGoal = asyncHandler(async (req, res) => {
  req.body.user = req.user._id;

  if (!req.body.title || !req.body.targetDate) {
      res.status(400);
      throw new Error('Please provide at least a title and target date for the goal.');
  }
  if (new Date(req.body.targetDate) < Date.now()) {
      res.status(400);
      throw new Error('Target date cannot be in the past. If goal is overdue, set status directly.');
  }

  const goal = await Goal.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Goal created successfully!',
    data: goal,
  });
});

// @desc    Update an existing goal
// @route   PUT /api/v1/goals/:id
// @access  Private
const updateGoal = asyncHandler(async (req, res) => {
  let goal = await Goal.findById(req.params.id);

  if (!goal) {
    res.status(404);
    throw new Error('Goal not found.');
  }

  if (goal.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this goal.');
  }

  delete req.body.user; // Prevent changing goal ownership

  // Prevent setting targetDate in past for 'active' goals
  if (req.body.targetDate && new Date(req.body.targetDate) < Date.now() && req.body.status !== 'completed' && req.body.status !== 'overdue') {
      res.status(400);
      throw new Error('Cannot set target date in the past for an active or uncompleted goal.');
  }
  // Ensure progress is within 0-100 range if provided
  if (req.body.progress !== undefined) {
      req.body.progress = Math.min(100, Math.max(0, req.body.progress));
  }


  goal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Goal updated successfully!',
    data: goal,
  });
});

// @desc    Delete an existing goal
// @route   DELETE /api/v1/goals/:id
// @access  Private
const deleteGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);

  if (!goal) {
    res.status(404);
    throw new Error('Goal not found.');
  }

  if (goal.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this goal.');
  }

  await goal.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Goal deleted successfully!',
  });
});

module.exports = {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
};