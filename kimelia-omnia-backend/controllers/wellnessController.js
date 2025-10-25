const asyncHandler = require('../utils/asyncHandler');
const WellnessRecord = require('../models/WellnessRecord');
const Task = require('../models/Task');
const Event = require('../models/Event');
const Goal = require('../models/Goal'); // For deeper context
const { getWellnessSuggestion } = require('../services/aiService');

// --- Wellness Record CRUD ---

// @desc    Get all wellness records for the authenticated user
// @route   GET /api/v1/wellness-records
// @access  Private
const getWellnessRecords = asyncHandler(async (req, res) => {
  const { type, startDate, endDate } = req.query;
  const query = { user: req.user._id };

  if (type) query.type = type;
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const records = await WellnessRecord.find(query).sort({ date: -1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: records.length,
    data: records,
  });
});

// @desc    Get a single wellness record by ID for the authenticated user
// @route   GET /api/v1/wellness-records/:id
// @access  Private
const getWellnessRecord = asyncHandler(async (req, res) => {
  const record = await WellnessRecord.findById(req.params.id);

  if (!record) {
    res.status(404);
    throw new Error('Wellness record not found.');
  }

  if (record.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to access this wellness record.');
  }

  res.status(200).json({
    success: true,
    data: record,
  });
});

// @desc    Create a new wellness record
// @route   POST /api/v1/wellness-records
// @access  Private
const createWellnessRecord = asyncHandler(async (req, res) => {
  req.body.user = req.user._id;

  if (!req.body.type || !req.body.date) {
      res.status(400);
      throw new Error('Please provide a type and date for the wellness record.');
  }

  const record = await WellnessRecord.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Wellness record created successfully!',
    data: record,
  });
});

// @desc    Update an existing wellness record
// @route   PUT /api/v1/wellness-records/:id
// @access  Private
const updateWellnessRecord = asyncHandler(async (req, res) => {
  let record = await WellnessRecord.findById(req.params.id);

  if (!record) {
    res.status(404);
    throw new Error('Wellness record not found.');
  }

  if (record.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this wellness record.');
  }

  delete req.body.user;

  record = await WellnessRecord.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Wellness record updated successfully!',
    data: record,
  });
});

// @desc    Delete an existing wellness record
// @route   DELETE /api/v1/wellness-records/:id
// @access  Private
const deleteWellnessRecord = asyncHandler(async (req, res) => {
  const record = await WellnessRecord.findById(req.params.id);

  if (!record) {
    res.status(404);
    throw new Error('Wellness record not found.');
  }

  if (record.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this wellness record.');
  }

  await record.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Wellness record deleted successfully!',
  });
});

// --- AI-Powered Wellness Suggestions ---

// @desc    Get AI-driven wellness suggestion
// @route   POST /api/v1/wellness/suggest
// @access  Private
const getWellnessSuggestionController = asyncHandler(async (req, res) => {
    const { suggestionType = 'general', customContext } = req.body;

    // --- Deeper Data Fetch for AI Context ---
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay()); // Sunday

    // Recent tasks
    const recentPendingTasks = await Task.find({ user: req.user._id, status: { $ne: 'completed' }, dueDate: { $gte: startOfDay } }).limit(5).select('title priority dueDate').lean();
    const overdueTasksToday = await Task.countDocuments({ user: req.user._id, status: 'pending', dueDate: { $lt: startOfDay } });

    // Current/upcoming events
    const currentEvents = await Event.find({ user: req.user._id, startTime: { $lte: now }, endTime: { $gte: now } }).limit(2).select('title category').lean();
    const upcomingEventsToday = await Event.find({ user: req.user._id, startTime: { $gte: now, $lte: new Date(now.getTime() + 12 * 60 * 60 * 1000) } }).limit(3).select('title startTime category').lean(); // Next 12 hours

    // Recent wellness activities
    const last24hWellness = await WellnessRecord.find({ user: req.user._id, date: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } }).limit(5).sort({ date: -1 }).select('type date durationMinutes moodBefore moodAfter').lean();
    const completedWellnessToday = await WellnessRecord.countDocuments({ user: req.user._id, date: { $gte: startOfDay } });

    // User's active goals
    const activeGoals = await Goal.find({ user: req.user._id, status: 'active' }).limit(3).select('title progress targetDate').lean();


    const detailedWellnessContext = {
        userName: req.user.name.split(' ')[0],
        currentTimestamp: now.toISOString(),
        currentMoodInput: customContext?.currentMood || 'neutral', // Allow user to directly input current mood
        recentProductivity: {
            tasksPendingSoon: recentPendingTasks,
            overdueTasksToday,
            activeEvents: currentEvents,
            upcomingEventsNext12h: upcomingEventsToday,
        },
        recentWellnessActivity: {
            loggedActivitiesLast24h: last24hWellness,
            totalLoggedToday: completedWellnessToday,
        },
        activeGoalsSummary: activeGoals,
        requestedSuggestionType: suggestionType,
        userProvidedContext: customContext,
    };

    const suggestion = await getWellnessSuggestion(detailedWellnessContext, suggestionType);

    res.status(200).json({
        success: true,
        message: `AI-driven ${suggestionType} suggestion generated.`,
        data: { suggestion },
    });
});


module.exports = {
  getWellnessRecords,
  getWellnessRecord,
  createWellnessRecord,
  updateWellnessRecord,
  deleteWellnessRecord,
  getWellnessSuggestionController,
};