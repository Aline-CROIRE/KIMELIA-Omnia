const asyncHandler = require('../utils/asyncHandler');
const LearningResource = require('../models/LearningResource');
const { Types } = require('mongoose'); // Import Mongoose Types for ObjectId validation
const { getMotivationalTip } = require('../services/aiService'); // Ensure this is implemented or mocked

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
  // --- IMPORTANT: Ensure relatedGoal is a valid ObjectId if present in query ---
  if (relatedGoal && !Types.ObjectId.isValid(relatedGoal)) {
      res.status(400);
      throw new Error('Invalid relatedGoal ID format in query.');
  }
  if (relatedGoal) query.relatedGoal = relatedGoal;
  // --- END IMPORTANT ---
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
  // --- NEW: Manual validation for ID, matching other controllers ---
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Learning Resource ID format.');
  }
  // --- END NEW VALIDATION ---

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
  // --- IMPORTANT: Validate relatedGoal if present in body ---
  if (req.body.relatedGoal && !Types.ObjectId.isValid(req.body.relatedGoal)) {
      res.status(400);
      throw new Error('Invalid relatedGoal ID format in request body.');
  }
  // --- END IMPORTANT ---

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
  // --- NEW: Manual validation for ID, matching other controllers ---
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Learning Resource ID format.');
  }
  // --- END NEW VALIDATION ---

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

  // --- IMPORTANT: Validate relatedGoal if present in body for update ---
  if (req.body.relatedGoal && !Types.ObjectId.isValid(req.body.relatedGoal)) {
      res.status(400);
      throw new Error('Invalid relatedGoal ID format in request body.');
  }
  // --- END IMPORTANT ---

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
  // --- NEW: Manual validation for ID, matching other controllers ---
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Learning Resource ID format.');
  }
  // --- END NEW VALIDATION ---

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
  const tip = await getMotivationalTip(req.user._id);

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