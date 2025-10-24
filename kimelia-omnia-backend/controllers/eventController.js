const asyncHandler = require('../utils/asyncHandler');
const Event = require('../models/Event');

// @desc    Get all events for the authenticated user (optionally filtered by date range)
// @route   GET /api/v1/events
// @access  Private
const getEvents = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const query = { user: req.user._id };

  if (startDate && endDate) {
    // Filter events that overlap with the given date range
    // An event overlaps if its start time is before the end of the range,
    // AND its end time is after the start of the range.
    query.startTime = { $lt: new Date(endDate) };
    query.endTime = { $gt: new Date(startDate) };
  } else if (startDate) {
      // Get events starting after startDate
      query.startTime = { $gte: new Date(startDate) };
  } else if (endDate) {
      // Get events ending before endDate
      query.endTime = { $lte: new Date(endDate) };
  }


  const events = await Event.find(query).sort({ startTime: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: events.length,
    data: events,
  });
});

// @desc    Get a single event by ID for the authenticated user
// @route   GET /api/v1/events/:id
// @access  Private
const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found.');
  }

  // Ensure the event belongs to the authenticated user
  if (event.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to access this event.');
  }

  res.status(200).json({
    success: true,
    data: event,
  });
});

// @desc    Create a new event
// @route   POST /api/v1/events
// @access  Private
const createEvent = asyncHandler(async (req, res) => {
  req.body.user = req.user._id;

  // Basic validation for required fields
  if (!req.body.title || !req.body.startTime || !req.body.endTime) {
      res.status(400);
      throw new Error('Please provide at least a title, start time, and end time for the event.');
  }

  // More robust server-side validation for dates
  if (new Date(req.body.startTime) >= new Date(req.body.endTime)) {
      res.status(400);
      throw new Error('Event end time must be after start time.');
  }

  const event = await Event.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Event created successfully!',
    data: event,
  });
});

// @desc    Update an existing event
// @route   PUT /api/v1/events/:id
// @access  Private
const updateEvent = asyncHandler(async (req, res) => {
  let event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found.');
  }

  // Ensure the event belongs to the authenticated user
  if (event.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this event.');
  }

  // Prevent user from changing the 'user' field
  delete req.body.user;

  // More robust server-side validation for dates if they are being updated
  if (req.body.startTime || req.body.endTime) {
      const newStartTime = req.body.startTime ? new Date(req.body.startTime) : event.startTime;
      const newEndTime = req.body.endTime ? new Date(req.body.endTime) : event.endTime;
      if (newStartTime >= newEndTime) {
          res.status(400);
          throw new Error('Updated event end time must be after start time.');
      }
  }

  event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // Return the updated document
    runValidators: true, // Run Mongoose validators on update
  });

  res.status(200).json({
    success: true,
    message: 'Event updated successfully!',
    data: event,
  });
});

// @desc    Delete an existing event
// @route   DELETE /api/v1/events/:id
// @access  Private
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found.');
  }

  // Ensure the event belongs to the authenticated user
  if (event.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this event.');
  }

  await event.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Event deleted successfully!',
  });
});

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
};