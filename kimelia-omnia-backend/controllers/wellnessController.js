const asyncHandler = require('../utils/asyncHandler');
const WellnessRecord = require('../models/WellnessRecord');
const Task = require('../models/Task'); // For context
const Event = require('../models/Event'); // For context
const { getWellnessSuggestion } = require('../services/aiService'); // Import AI wellness suggestion function

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

  // Ensure the record belongs to the authenticated user
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
    const { suggestionType = 'general', customContext } = req.body; // e.g., 'break', 'meal', 'exercise', 'mindfulness'

    // Fetch recent user activity for AI context (e.g., busy schedule implies need for breaks)
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const recentTasks = await Task.find({ user: req.user._id, status: { $ne: 'completed' }, createdAt: { $gte: twoHoursAgo } }).limit(5).select('title priority').lean();
    const currentEvents = await Event.find({ user: req.user._id, startTime: { $lte: now }, endTime: { $gte: now } }).limit(3).select('title category').lean();
    const lastWellnessRecord = await WellnessRecord.findOne({ user: req.user._id }).sort({ date: -1 }).limit(1).lean();

    const userWellnessContext = {
        currentActivity: currentEvents.length > 0 ? `Currently in ${currentEvents[0].title}` : 'No active events',
        recentHighPriorityTasks: recentTasks.filter(task => task.priority === 'high').map(task => task.title),
        lastLoggedWellnessActivity: lastWellnessRecord ? { type: lastWellnessRecord.type, date: lastWellnessRecord.date, details: lastWellnessRecord.details } : 'None recently logged.',
        customContext, // User can provide additional context from frontend
    };

    const suggestion = await getWellnessSuggestion(userWellnessContext, suggestionType);

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
  getWellnessSuggestionController, // Export the new controller function
};