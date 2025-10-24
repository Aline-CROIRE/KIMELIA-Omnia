
const asyncHandler = require('../utils/asyncHandler');
const LearningResource = require('../models/LearningResource');
const { getMotivationalTip } = require('../services/aiService'); // We'll add this to aiService.js soon

// --- Learning Resource CRUD ---

// @desc    Get all learning resources for the authenticated user
// @route   GET /api/v1/learning-resources
// @access  Private
const getLearningResources = asyncHandler(async (req, res) => {
  const { type, category, tag, search, relatedGoal } = req.query;
  const query = { user: req.user._id };

  if (type) query.type = type;
  if (category) query.category = category;
  if (tag) query.tags = { $in: [tag] };
  if (relatedGoal) query.relatedGoal = relatedGoal;
  if (search) {
      query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
      ];
  }

  const resources = await LearningResource.find(query).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: resources.length,
    data: resources,
  });
});

// @desc    Get a single learning resource by ID for the authenticated user
// @route   GET /api/v1/learning-resources/:id
// @access  Private
const getLearningResource = asyncHandler(async (req, res) => {
  const resource = await LearningResource.findById(req.params.id);

  if (!resource) {
    res.status(404);
    throw new Error('Learning resource not found.');
  }

  // Ensure the resource belongs to the authenticated user
  if (resource.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to access this learning resource.');
  }

  res.status(200).json({
    success: true,
    data: resource,
  });
});

// @desc    Create a new learning resource
// @route   POST /api/v1/learning-resources
// @access  Private
const createLearningResource = asyncHandler(async (req, res) => {
  req.body.user = req.user._id;

  if (!req.body.title || !req.body.url || !req.body.type) {
      res.status(400);
      throw new Error('Please provide at least a title, URL, and type for the learning resource.');
  }

  const resource = await LearningResource.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Learning resource created successfully!',
    data: resource,
  });
});

// @desc    Update an existing learning resource
// @route   PUT /api/v1/learning-resources/:id
// @access  Private
const updateLearningResource = asyncHandler(async (req, res) => {
  let resource = await LearningResource.findById(req.params.id);

  if (!resource) {
    res.status(404);
    throw new Error('Learning resource not found.');
  }

  if (resource.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this learning resource.');
  }

  delete req.body.user;

  resource = await LearningResource.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Learning resource updated successfully!',
    data: resource,
  });
});

// @desc    Delete an existing learning resource
// @route   DELETE /api/v1/learning-resources/:id
// @access  Private
const deleteLearningResource = asyncHandler(async (req, res) => {
  const resource = await LearningResource.findById(req.params.id);

  if (!resource) {
    res.status(404);
    throw new Error('Learning resource not found.');
  }

  if (resource.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this learning resource.');
  }

  await resource.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Learning resource deleted successfully!',
  });
});


// --- Motivational Tips ---

// @desc    Get a motivational tip (potentially AI-generated in future)
// @route   GET /api/v1/coach/motivational-tip
// @access  Private
const getMotivationalTipController = asyncHandler(async (req, res) => {
  // For now, a simple random tip.
  // In the future, this would call an AI service, possibly passing user's current goals/progress
  // to get a personalized tip.
  const tip = await getMotivationalTip(req.user._id); // Pass user ID for potential personalization

  res.status(200).json({
    success: true,
    data: {
      tip: tip,
      source: 'Omnia Coach'
    },
  });
});


module.exports = {
  getLearningResources,
  getLearningResource,
  createLearningResource,
  updateLearningResource,
  deleteLearningResource,
  getMotivationalTipController,
};