const asyncHandler = require('../utils/asyncHandler');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense'); // To calculate actual spending against budget (future)

// @desc    Get all budgets for the authenticated user
// @route   GET /api/v1/budgets
// @access  Private
const getBudgets = asyncHandler(async (req, res) => {
  const { category, periodType, activeOnly } = req.query;
  const query = { user: req.user._id };

  if (category) query.category = category;
  if (periodType) query.periodType = periodType;
  if (activeOnly === 'true') {
      // Filter for budgets that are currently active
      query.startDate = { $lte: new Date() };
      query.endDate = { $gte: new Date() };
  }

  const budgets = await Budget.find(query).sort({ startDate: -1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: budgets.length,
    data: budgets,
  });
});

// @desc    Get a single budget by ID for the authenticated user
// @route   GET /api/v1/budgets/:id
// @access  Private
const getBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findById(req.params.id);

  if (!budget) {
    res.status(404);
    throw new Error('Budget not found.');
  }

  // Ensure the budget belongs to the authenticated user
  if (budget.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to access this budget.');
  }

  res.status(200).json({
    success: true,
    data: budget,
  });
});

// @desc    Create a new budget
// @route   POST /api/v1/budgets
// @access  Private
const createBudget = asyncHandler(async (req, res) => {
  req.body.user = req.user._id;

  if (!req.body.category || req.body.limitAmount === undefined || !req.body.startDate || !req.body.endDate) {
      res.status(400);
      throw new Error('Please provide category, limit amount, start date, and end date for the budget.');
  }
  if (new Date(req.body.startDate) >= new Date(req.body.endDate)) {
      res.status(400);
      throw new Error('Budget end date must be after start date.');
  }

  // Optional: Prevent overlapping budgets for the same category/period for a user
  // const existingBudget = await Budget.findOne({
  //     user: req.user._id,
  //     category: req.body.category,
  //     $or: [
  //         { startDate: { $lt: new Date(req.body.endDate), $gte: new Date(req.body.startDate) } },
  //         { endDate: { $gt: new Date(req.body.startDate), $lte: new Date(req.body.endDate) } },
  //         { startDate: { $lte: new Date(req.body.startDate) }, endDate: { $gte: new Date(req.body.endDate) } },
  //     ]
  // });
  // if (existingBudget) {
  //     res.status(409);
  //     throw new Error('An overlapping budget already exists for this category and period.');
  // }


  const budget = await Budget.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Budget created successfully!',
    data: budget,
  });
});

// @desc    Update an existing budget
// @route   PUT /api/v1/budgets/:id
// @access  Private
const updateBudget = asyncHandler(async (req, res) => {
  let budget = await Budget.findById(req.params.id);

  if (!budget) {
    res.status(404);
    throw new Error('Budget not found.');
  }

  // Ensure the budget belongs to the authenticated user
  if (budget.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this budget.');
  }

  delete req.body.user; // Prevent changing budget ownership

  // Server-side validation for dates if they are being updated
  if (req.body.startDate || req.body.endDate) {
      const newStartDate = req.body.startDate ? new Date(req.body.startDate) : budget.startDate;
      const newEndDate = req.body.endDate ? new Date(req.body.endDate) : budget.endDate;
      if (newStartDate >= newEndDate) {
          res.status(400);
          throw new Error('Updated budget end date must be after start date.');
      }
  }


  budget = await Budget.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Budget updated successfully!',
    data: budget,
  });
});

// @desc    Delete an existing budget
// @route   DELETE /api/v1/budgets/:id
// @access  Private
const deleteBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findById(req.params.id);

  if (!budget) {
    res.status(404);
    throw new Error('Budget not found.');
  }

  // Ensure the budget belongs to the authenticated user
  if (budget.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this budget.');
  }

  await budget.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Budget deleted successfully!',
  });
});

module.exports = {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
};