const asyncHandler = require('../utils/asyncHandler');
const Task = require('../models/Task');
const Event = require('../models/Event');
const Goal = require('../models/Goal');
const Expense = require('../models/Expense');
const {
  getPersonalizedProductivityRecommendation,
  getPersonalizedGoalRecommendation,
} = require('../services/aiService'); // Import AI recommendation functions

// Helper function to get date range for reports
const getDateRange = (period = 'week') => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    endDate.setHours(23, 59, 59, 999); // End of today

    if (period === 'day') {
        startDate.setHours(0, 0, 0, 0); // Start of today
    } else if (period === 'week') {
        startDate.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
        startDate.setHours(0, 0, 0, 0);
    } else if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of current month
        endDate.setHours(23, 59, 59, 999);
    } else if (period === 'year') {
        startDate = new Date(now.getFullYear(), 0, 1); // Start of current year
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), 11, 31); // End of current year
        endDate.setHours(23, 59, 59, 999);
    } else { // Default to week
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
    }

    return { startDate, endDate };
};


// @desc    Get a productivity summary report for a given period
// @route   GET /api/v1/insights/productivity-summary
// @access  Private
const getProductivitySummary = asyncHandler(async (req, res) => {
  const { period = 'week' } = req.query; // 'day', 'week', 'month', 'year'
  const { startDate, endDate } = getDateRange(period);

  // Fetch relevant data for the user within the period
  const totalTasks = await Task.countDocuments({ user: req.user._id, createdAt: { $gte: startDate, $lte: endDate } });
  const completedTasks = await Task.countDocuments({ user: req.user._id, status: 'completed', createdAt: { $gte: startDate, $lte: endDate } });
  const inProgressTasks = await Task.countDocuments({ user: req.user._id, status: 'in-progress', createdAt: { $gte: startDate, $lte: endDate } });
  const upcomingEvents = await Event.countDocuments({ user: req.user._id, startTime: { $gte: new Date() } }); // Always future events
  const overdueGoals = await Goal.countDocuments({ user: req.user._id, status: 'overdue' });
  const activeGoals = await Goal.countDocuments({ user: req.user._id, status: 'active' });

  res.status(200).json({
    success: true,
    data: {
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(2) : 0,
      },
      events: {
        upcoming: upcomingEvents,
      },
      goals: {
        active: activeGoals,
        overdue: overdueGoals,
      },
    },
  });
});

// @desc    Get a spending summary report by category for a given period
// @route   GET /api/v1/insights/spending-summary
// @access  Private
const getSpendingSummary = asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;
  const { startDate, endDate } = getDateRange(period);

  const spendingByCategory = await Expense.aggregate([
    {
      $match: {
        user: req.user._id,
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$category',
        totalSpent: { $sum: '$amount' }
      }
    },
    {
      $project: {
        category: '$_id',
        totalSpent: { $round: ['$totalSpent', 2] }, // Round to 2 decimal places
        _id: 0
      }
    },
    {
        $sort: { totalSpent: -1 }
    }
  ]);

  const totalOverallSpent = spendingByCategory.reduce((sum, item) => sum + item.totalSpent, 0).toFixed(2);

  res.status(200).json({
    success: true,
    data: {
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalOverallSpent: parseFloat(totalOverallSpent),
      spendingByCategory,
    },
  });
});

// @desc    Get AI-driven productivity recommendations
// @route   POST /api/v1/insights/ai-productivity-recommendations
// @access  Private
const getAIPersonalityRecommendation = asyncHandler(async (req, res) => {
  // Frontend might send specific context in req.body, or we fetch fresh data
  const { period = 'week', customContext } = req.body; // Allow period or custom context
  const { startDate, endDate } = getDateRange(period);

  // Fetching a deeper summary for AI
  const recentTasks = await Task.find({ user: req.user._id, createdAt: { $gte: startDate, $lte: endDate } }).limit(10).select('title status dueDate priority').lean();
  const recentEvents = await Event.find({ user: req.user._id, startTime: { $gte: startDate, $lte: endDate } }).limit(5).select('title startTime endTime category').lean();
  const activeGoals = await Goal.find({ user: req.user._id, status: 'active' }).limit(3).select('title progress targetDate').lean();

  const userDataSummary = {
    period: `${period} (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`,
    recentTasks,
    recentEvents,
    activeGoals,
    customContext, // If frontend provides additional context
  };

  const recommendation = await getPersonalizedProductivityRecommendation(userDataSummary);

  res.status(200).json({
    success: true,
    message: 'AI productivity recommendations generated.',
    data: { recommendation },
  });
});

// @desc    Get AI-driven recommendations for a specific goal
// @route   POST /api/v1/insights/ai-goal-recommendations/:goalId
// @access  Private
const getAIGoalRecommendation = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.goalId);

  if (!goal) {
    res.status(404);
    throw new Error('Goal not found for recommendations.');
  }
  // Ensure the goal belongs to the authenticated user
  if (goal.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to get recommendations for this goal.');
  }

  // Fetch related tasks for richer context
  const relatedTasks = await Task.find({ user: req.user._id, project: goal._id }).select('title status priority dueDate').lean();

  const goalDataForAI = {
    title: goal.title,
    description: goal.description,
    category: goal.category,
    targetDate: goal.targetDate.toISOString(),
    progress: goal.progress,
    status: goal.status,
    relatedTasks,
    // Add more context if needed
  };

  const recommendation = await getPersonalizedGoalRecommendation(goalDataForAI);

  res.status(200).json({
    success: true,
    message: `AI recommendations for goal "${goal.title}" generated.`,
    data: { recommendation },
  });
});


module.exports = {
  getProductivitySummary,
  getSpendingSummary,
  getAIPersonalityRecommendation,
  getAIGoalRecommendation,
};