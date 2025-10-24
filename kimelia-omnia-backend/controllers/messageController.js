const asyncHandler = require('../utils/asyncHandler');
const Message = require('../models/Message');
const { summarizeText, draftMessage } = require('../services/aiService'); // Import AI Service functions

// @desc    Get all smart communication entries for the authenticated user
// @route   GET /api/v1/messages
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
  const { type, status, tag, search } = req.query;
  const query = { user: req.user._id };

  if (type) query.type = type;
  if (status) query.status = status;
  if (tag) query.tags = { $in: [tag] }; // Search for messages with a specific tag
  if (search) {
      // Basic text search on subject and content (case-insensitive)
      query.$or = [
          { subject: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
      ];
  }

  const messages = await Message.find(query).sort({ createdAt: -1 }); // Sort by newest first

  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages,
  });
});

// @desc    Get a single smart communication entry by ID for the authenticated user
// @route   GET /api/v1/messages/:id
// @access  Private
const getMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    res.status(404);
    throw new Error('Communication entry not found.');
  }

  // Ensure the message belongs to the authenticated user
  if (message.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to access this communication entry.');
  }

  res.status(200).json({
    success: true,
    data: message,
  });
});

// @desc    Create a new smart communication entry
// @route   POST /api/v1/messages
// @access  Private
const createMessage = asyncHandler(async (req, res) => {
  // Ensure the message is associated with the authenticated user
  req.body.user = req.user._id;

  // Basic validation for required fields
  if (!req.body.type || !req.body.content) {
      res.status(400);
      throw new Error('Please provide at least a type and content for the communication entry.');
  }

  const message = await Message.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Communication entry created successfully!',
    data: message,
  });
});

// @desc    Update an existing smart communication entry
// @route   PUT /api/v1/messages/:id
// @access  Private
const updateMessage = asyncHandler(async (req, res) => {
  let message = await Message.findById(req.params.id);

  if (!message) {
    res.status(404);
    throw new Error('Communication entry not found.');
  }

  // Ensure the message belongs to the authenticated user
  if (message.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this communication entry.');
  }

  // Prevent user from changing the 'user' field
  delete req.body.user;

  message = await Message.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // Return the updated document
    runValidators: true, // Run Mongoose validators on update
  });

  res.status(200).json({
    success: true,
    message: 'Communication entry updated successfully!',
    data: message,
  });
});

// @desc    Delete an existing smart communication entry
// @route   DELETE /api/v1/messages/:id
// @access  Private
const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    res.status(404);
    throw new Error('Communication entry not found.');
  }

  // Ensure the message belongs to the authenticated user
  if (message.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this communication entry.');
  }

  await message.deleteOne(); // Using deleteOne() for Mongoose 6+

  res.status(200).json({
    success: true,
    message: 'Communication entry deleted successfully!',
  });
});

// --- AI-Powered Endpoints ---

// @desc    Summarize given text using AI
// @route   POST /api/v1/messages/ai/summarize
// @access  Private
const summarizeContent = asyncHandler(async (req, res) => {
  const { text, promptPrefix } = req.body;

  if (!text) {
    res.status(400);
    throw new Error('Please provide text to summarize.');
  }

  const summary = await summarizeText(text, promptPrefix);

  res.status(200).json({
    success: true,
    message: 'Content summarized by AI.',
    data: { summary },
  });
});

// @desc    Generate a message draft using AI
// @route   POST /api/v1/messages/ai/draft
// @access  Private
const generateDraft = asyncHandler(async (req, res) => {
  const { instruction, context, tone, format } = req.body;

  if (!instruction) {
    res.status(400);
    throw new Error('Please provide instructions for the message draft.');
  }

  const draft = await draftMessage(instruction, context, tone, format);

  res.status(200).json({
    success: true,
    message: 'Message draft generated by AI.',
    data: { draft },
  });
});


module.exports = {
  getMessages,
  getMessage,
  createMessage,
  updateMessage,
  deleteMessage,
  summarizeContent,
  generateDraft,
};