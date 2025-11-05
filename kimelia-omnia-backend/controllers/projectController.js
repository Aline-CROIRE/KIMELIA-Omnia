const asyncHandler = require('../utils/asyncHandler');
const Project = require('../models/Project'); // Assuming you have a Project model
const User = require('../models/User');     // Assuming you have a User model
const { Types } = require('mongoose');      // For ObjectId validation

// @desc    Get all projects for the authenticated user
// @route   GET /api/v1/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
  const { status, priority, tag, search } = req.query;
  const query = {
    $or: [
      { owner: req.user._id },
      { members: req.user._id }
    ]
  };

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (tag) query.tags = { $in: [tag] };
  if (search) {
      query.$or.push(
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
      );
  }

  const projects = await Project.find(query).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: projects.length,
    data: projects,
  });
});

// @desc    Get a single project by ID for the authenticated user
// @route   GET /api/v1/projects/:id
// @access  Private
const getProject = asyncHandler(async (req, res) => {
  // Manual validation for ID
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Project ID format.');
  }

  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found.');
  }

  // Ensure the user is either the owner or a member of the project
  const isOwner = project.owner.toString() === req.user._id.toString();
  const isMember = project.members.some(member => member.toString() === req.user._id.toString());

  if (!isOwner && !isMember) {
    res.status(401);
    throw new Error('Not authorized to access this project.');
  }

  res.status(200).json({
    success: true,
    data: project,
  });
});

// @desc    Create a new project
// @route   POST /api/v1/projects
// @access  Private
const createProject = asyncHandler(async (req, res) => {
  req.body.owner = req.user._id; // Set the owner to the authenticated user

  if (!req.body.title) {
      res.status(400);
      throw new Error('Please provide a title for the project.');
  }
  
  // Ensure that if members are passed, they are valid ObjectIds
  if (req.body.members && !Array.isArray(req.body.members)) {
      res.status(400);
      throw new Error('Members must be an array of user IDs.');
  }
  if (req.body.members) {
      for (const memberId of req.body.members) {
          if (!Types.ObjectId.isValid(memberId)) {
              res.status(400);
              throw new Error(`Invalid member ID format: ${memberId}.`);
          }
          const memberUser = await User.findById(memberId);
          if (!memberUser) {
              res.status(404);
              throw new Error(`User with ID ${memberId} not found.`);
          }
      }
  }

  const project = await Project.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Project created successfully!',
    data: project,
  });
});

// @desc    Update an existing project
// @route   PUT /api/v1/projects/:id
// @access  Private
const updateProject = asyncHandler(async (req, res) => {
  // Manual validation for ID
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Project ID format.');
  }

  let project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found.');
  }

  // Only the project owner can update basic project details
  if (project.owner.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this project.');
  }

  delete req.body.owner; // Prevent changing project ownership
  delete req.body.members; // Members handled by specific add/remove routes if complex logic is needed

  // Validate start/end dates if provided
  if (req.body.startDate || req.body.endDate) {
      const newStartDate = req.body.startDate ? new Date(req.body.startDate) : project.startDate;
      const newEndDate = req.body.endDate ? new Date(req.body.endDate) : project.endDate;
      if (newStartDate && newEndDate && newStartDate >= newEndDate) {
          res.status(400);
          throw new Error('Project end date must be after start date.');
      }
  }

  project = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Project updated successfully!',
    data: project,
  });
});

// @desc    Delete an existing project
// @route   DELETE /api/v1/projects/:id
// @access  Private
const deleteProject = asyncHandler(async (req, res) => {
  // Manual validation for ID
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Project ID format.');
  }

  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found.');
  }

  // Only the project owner can delete it
  if (project.owner.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this project.');
  }

  await project.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Project deleted successfully!',
  });
});

// @desc    Add a member to a project
// @route   POST /api/v1/projects/:id/members
// @access  Private
const addProjectMember = asyncHandler(async (req, res) => {
    // Manual validation for project ID
    if (!Types.ObjectId.isValid(req.params.id)) {
        res.status(400);
        throw new Error('Invalid Project ID format.');
    }
    // memberId validated by Joi (validateAddRemoveMember)

    const { memberId } = req.body;

    let project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found.');
    }

    // Only the project owner can add members
    if (project.owner.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to add members to this project.');
    }

    if (project.members.includes(memberId)) {
        res.status(400);
        throw new Error('User is already a member of this project.');
    }
    if (project.owner.toString() === memberId.toString()) {
        res.status(400);
        throw new Error('Cannot add project owner as a member.');
    }

    project.members.push(memberId);
    await project.save();

    res.status(200).json({
        success: true,
        message: 'Member added to project successfully!',
        data: project,
    });
});

// @desc    Remove a member from a project
// @route   DELETE /api/v1/projects/:id/members
// @access  Private
const removeProjectMember = asyncHandler(async (req, res) => {
    // Manual validation for project ID
    if (!Types.ObjectId.isValid(req.params.id)) {
        res.status(400);
        throw new Error('Invalid Project ID format.');
    }
    // memberId validated by Joi (validateAddRemoveMember)

    const { memberId } = req.body; // or req.params.memberId if using a different route structure

    let project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found.');
    }

    // Only the project owner can remove members
    if (project.owner.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to remove members from this project.');
    }
    if (project.owner.toString() === memberId.toString()) {
        res.status(400);
        throw new Error('Cannot remove project owner as a member.');
    }

    const initialLength = project.members.length;
    project.members = project.members.filter(
        member => member.toString() !== memberId.toString()
    );

    if (project.members.length === initialLength) {
        res.status(404);
        throw new Error('Member not found in this project.');
    }

    await project.save();

    res.status(200).json({
        success: true,
        message: 'Member removed from project successfully!',
        data: project,
    });
});


module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
};