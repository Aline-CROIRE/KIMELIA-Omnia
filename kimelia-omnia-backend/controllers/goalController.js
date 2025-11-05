const asyncHandler = require('../utils/asyncHandler');
const Goal = require('../models/Goal');
const { Types } = require('mongoose'); // Import Mongoose Types for ObjectId validation

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
  // --- NEW: Manual validation for ID, matching Task/Event controllers ---
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Goal ID format.');
  }
  // --- END NEW VALIDATION ---

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

  // Joi schema now handles targetDate.min(new Date()) for create.
  // No need for explicit check here unless more complex logic is required.

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
  // --- NEW: Manual validation for ID, matching Task/Event controllers ---
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Goal ID format.');
  }
  // --- END NEW VALIDATION ---

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

  // --- REFINED TARGET DATE VALIDATION FOR UPDATES ---
  if (req.body.targetDate) {
    const newTargetDate = new Date(req.body.targetDate);
    const now = new Date();

    // If the new target date is in the past
    if (newTargetDate < now) {
      // Allow if the goal is already completed or cancelled (or status is being set to completed/cancelled)
      if (req.body.status === 'completed' || req.body.status === 'cancelled' || goal.status === 'completed' || goal.status === 'cancelled') {
        // Valid, can update to past date if goal is finished
      }
      // Allow if the goal was already overdue AND we are not changing status to active/in-progress
      else if (newTargetDate < new Date(goal.targetDate) && (goal.status === 'overdue' || goal.status === 'on_hold')) {
         // Valid, allowing to update an already past target date, for example, to a slightly earlier past date,
         // or if the status is also updated to overdue/cancelled
      }
      else if (req.body.status && (req.body.status === 'active' || req.body.status === 'in-progress')) {
          res.status(400);
          throw new Error('Target date cannot be in the past for active or in-progress goals.');
      }
      else if (goal.status === 'active' || goal.status === 'in-progress') {
        res.status(400);
        throw new Error('Target date cannot be moved to the past for an active or in-progress goal.');
      }
    }
  }
  // --- END REFINED TARGET DATE VALIDATION ---

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
  // --- NEW: Manual validation for ID, matching Task/Event controllers ---
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Goal ID format.');
  }
  // --- END NEW VALIDATION ---

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