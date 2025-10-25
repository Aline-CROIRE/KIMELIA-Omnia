const asyncHandler = require('../utils/asyncHandler');
const Expense = require('../models/Expense');

// @desc    Get all expenses for the authenticated user
// @route   GET /api/v1/expenses
// @access  Private
const getExpenses = asyncHandler(async (req, res) => {
  const { category, startDate, endDate, tag, search } = req.query;
  const query = { user: req.user._id };

  if (category) query.category = category;
  if (tag) query.tags = { $in: [tag] };

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  if (search) {
      query.$or = [
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } },
      ];
  }

  const expenses = await Expense.find(query).sort({ date: -1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: expenses.length,
    data: expenses,
  });
});

// @desc    Get a single expense by ID for the authenticated user
// @route   GET /api/v1/expenses/:id
// @access  Private
const getExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    res.status(404);
    throw new Error('Expense not found.');
  }

  // Ensure the expense belongs to the authenticated user
  if (expense.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to access this expense.');
  }

  res.status(200).json({
    success: true,
    data: expense,
  });
});

// @desc    Create a new expense
// @route   POST /api/v1/expenses
// @access  Private
const createExpense = asyncHandler(async (req, res) => {
  req.body.user = req.user._id;

  if (!req.body.amount || !req.body.category || !req.body.date) {
      res.status(400);
      throw new Error('Please provide amount, category, and date for the expense.');
  }

  const expense = await Expense.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Expense recorded successfully!',
    data: expense,
  });
});

// @desc    Update an existing expense
// @route   PUT /api/v1/expenses/:id
// @access  Private
const updateExpense = asyncHandler(async (req, res) => {
  let expense = await Expense.findById(req.params.id);

  if (!expense) {
    res.status(404);
    throw new Error('Expense not found.');
  }

  // Ensure the expense belongs to the authenticated user
  if (expense.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this expense.');
  }

  delete req.body.user; // Prevent changing expense ownership

  expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Expense updated successfully!',
    data: expense,
  });
});

// @desc    Delete an existing expense
// @route   DELETE /api/v1/expenses/:id
// @access  Private
const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    res.status(404);
    throw new Error('Expense not found.');
  }

  // Ensure the expense belongs to the authenticated user
  if (expense.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this expense.');
  }

  await expense.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Expense deleted successfully!',
  });
});

module.exports = {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
};