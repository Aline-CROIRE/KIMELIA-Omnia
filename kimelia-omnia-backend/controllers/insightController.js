const asyncHandler = require('../utils/asyncHandler');
const Task = require('../models/Task');
const Event = require('../models/Event');
const Goal = require('../models/Goal');
const Expense = require('../models/Expense');
const LearningResource = require('../models/LearningResource'); // For more context
const Project = require('../models/Project'); // For more context
const WellnessRecord = require('../models/WellnessRecord'); // For more context

const {
  getPersonalizedProductivityRecommendation,
  getPersonalizedGoalRecommendation,
} = require('../services/aiService');

// Helper function to get date range for reports
const getDateRange = (period = 'week', customStartDate, customEndDate) => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    if (customStartDate && customEndDate) {
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
    } else if (period === 'day') {
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
    } else if (period === 'week') {
        startDate.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // End of current week (Saturday)
        endDate.setHours(23, 59, 59, 999);
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
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
    }

    return { startDate, endDate };
};


// @desc    Get a productivity summary report for a given period
// @route   GET /api/v1/insights/productivity-summary
// @access  Private
const getProductivitySummary = asyncHandler(async (req, res) => {
  const { period = 'week', startDate: reqStartDate, endDate: reqEndDate } = req.query; // Allow custom date range
  const { startDate, endDate } = getDateRange(period, reqStartDate, reqEndDate);

  // Fetch relevant data for the user within the period
  const totalTasks = await Task.countDocuments({ user: req.user._id, createdAt: { $gte: startDate, $lte: endDate } });
  const completedTasks = await Task.countDocuments({ user: req.user._id, status: 'completed', createdAt: { $gte: startDate, $lte: endDate } });
  const inProgressTasks = await Task.countDocuments({ user: req.user._id, status: 'in-progress', createdAt: { $gte: startDate, $lte: endDate } });
  const overdueTasks = await Task.countDocuments({ user: req.user._id, status: 'pending', dueDate: { $lt: new Date() } }); // Overdue is pending & due date in past

  const totalEvents = await Event.countDocuments({ user: req.user._id, startTime: { $gte: startDate, $lte: endDate } });
  const upcomingEvents = await Event.countDocuments({ user: req.user._id, startTime: { $gte: new Date() } });
  const completedEvents = await Event.countDocuments({ user: req.user._id, endTime: { $lt: new Date() } });

  const activeGoals = await Goal.countDocuments({ user: req.user._id, status: 'active' });
  const completedGoals = await Goal.countDocuments({ user: req.user._id, status: 'completed' });
  const overdueGoals = await Goal.countDocuments({ user: req.user._id, status: 'overdue' });

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
        overdue: overdueTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(2) : 0,
      },
      events: {
        totalInPeriod: totalEvents,
        upcoming: upcomingEvents,
        completed: completedEvents,
      },
      goals: {
        active: activeGoals,
        completed: completedGoals,
        overdue: overdueGoals,
      },
    },
  });
});

// @desc    Get a spending summary report by category for a given period
// @route   GET /api/v1/insights/spending-summary
// @access  Private
const getSpendingSummary = asyncHandler(async (req, res) => {
  const { period = 'month', startDate: reqStartDate, endDate: reqEndDate } = req.query;
  const { startDate, endDate } = getDateRange(period, reqStartDate, reqEndDate);

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
        totalSpent: { $round: ['$totalSpent', 2] },
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
  const { period = 'week', customContext } = req.body;
  const { startDate, endDate } = getDateRange(period);

  // --- Deeper Data Fetch for AI ---
  const userName = req.user.name.split(' ')[0]; // First name for personalization
  const userEmail = req.user.email;
  const userRole = req.user.role;

  // Recent activity
  const recentTasks = await Task.find({ user: req.user._id, createdAt: { $gte: startDate, $lte: endDate } }).limit(15).select('title status dueDate priority').lean();
  const upcomingEvents = await Event.find({ user: req.user._id, startTime: { $gte: new Date() } }).limit(5).select('title startTime endTime category').lean();
  const completedTasksCount = await Task.countDocuments({ user: req.user._id, status: 'completed', createdAt: { $gte: startDate, $lte: endDate } });
  const pendingHighPriorityTasksCount = await Task.countDocuments({ user: req.user._id, status: 'pending', priority: 'high' });

  // Goal context
  const activeGoals = await Goal.find({ user: req.user._id, status: 'active' }).limit(5).select('title progress targetDate category').lean();
  const overdueGoals = await Goal.find({ user: req.user._id, status: 'overdue' }).limit(2).select('title targetDate').lean();

  // Wellness context (most recent for current state)
  const lastWellnessRecord = await WellnessRecord.findOne({ user: req.user._id }).sort({ date: -1 }).limit(1).lean();


  const comprehensiveUserData = {
    userName,
    userRole,
    period: `${period} (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`,
    recentActivitySummary: {
        totalTasksLogged: recentTasks.length,
        completedTasksInPeriod: completedTasksCount,
        pendingHighPriorityTasks: pendingHighPriorityTasksCount,
        tasksSample: recentTasks,
        upcomingEventsSample: upcomingEvents,
    },
    goalStatus: {
        activeGoalsCount: activeGoals.length,
        overdueGoalsCount: overdueGoals.length,
        activeGoalsSample: activeGoals,
    },
    recentWellness: lastWellnessRecord ? { type: lastWellnessRecord.type, date: lastWellnessRecord.date, details: lastWellnessRecord.details, moodAfter: lastWellnessRecord.moodAfter } : 'No recent wellness activity logged.',
    customUserChallenge: customContext, // Frontend can send specific struggles
  };

  const recommendation = await getPersonalizedProductivityRecommendation(comprehensiveUserData);

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
  if (goal.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to get recommendations for this goal.');
  }

  // --- Deeper Data Fetch for AI related to this goal ---
  const relatedTasks = await Task.find({ user: req.user._id, project: goal._id }).select('title status priority dueDate').lean();
  const relatedLearningResources = await LearningResource.find({ user: req.user._id, relatedGoal: goal._id }).select('title url type').lean();

  const detailedGoalData = {
    userName: req.user.name.split(' ')[0],
    goalTitle: goal.title,
    goalDescription: goal.description,
    goalCategory: goal.category,
    targetDate: goal.targetDate.toISOString(),
    currentProgressPercentage: goal.progress,
    currentStatus: goal.status,
    relatedTasksForContext: relatedTasks,
    suggestedLearningResources: relatedLearningResources,
    userChallenges: req.body.customContext, // Frontend can specify challenges with this goal
  };

  const recommendation = await getPersonalizedGoalRecommendation(detailedGoalData);

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