const asyncHandler = require('../utils/asyncHandler');
const Project = require('../models/Project');
const User = require('../models/User'); // To validate if member exists

// Helper to check if user is owner or member of a project
const checkProjectAccess = (project, userId) => {
  if (project.owner.toString() !== userId.toString() && !project.members.includes(userId)) {
    return false;
  }
  return true;
};

// @desc    Get all projects for the authenticated user (owner or member)
// @route   GET /api/v1/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
  const { status, priority, search } = req.query;
  const query = {
    $or: [ // Projects where user is owner OR a member
      { owner: req.user._id },
      { members: req.user._id }
    ]
  };

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (search) {
      query.$or.push( // Add search to existing $or or create a new one if no other conditions
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
      );
  }

  const projects = await Project.find(query)
    .populate('owner', 'name email') // Populate owner details
    .populate('members', 'name email') // Populate member details
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: projects.length,
    data: projects,
  });
});

// @desc    Get a single project by ID (owner or member)
// @route   GET /api/v1/projects/:id
// @access  Private
const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('owner', 'name email')
    .populate('members', 'name email');

  if (!project) {
    res.status(404);
    throw new Error('Project not found.');
  }

  // Ensure user is authorized to view this project
  if (!checkProjectAccess(project, req.user._id)) {
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
  req.body.owner = req.user._id; // Set the project owner to the authenticated user

  if (!req.body.title) {
      res.status(400);
      throw new Error('Please provide a project title.');
  }

  const project = await Project.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Project created successfully!',
    data: project,
  });
});

// @desc    Update an existing project (owner only)
// @route   PUT /api/v1/projects/:id
// @access  Private
const updateProject = asyncHandler(async (req, res) => {
  let project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found.');
  }

  // Only the project owner can update general project details
  if (project.owner.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this project.');
  }

  // Prevent direct modification of owner or members array via this route.
  // Use specific routes for member management.
  delete req.body.owner;
  delete req.body.members;
  delete req.body.files; // Files management will have its own routes

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

// @desc    Delete an existing project (owner only)
// @route   DELETE /api/v1/projects/:id
// @access  Private
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found.');
  }

  // Only the project owner can delete the project
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

// --- Project Member Management ---

// @desc    Add a member to a project (owner only)
// @route   PUT /api/v1/projects/:id/add-member
// @access  Private
const addProjectMember = asyncHandler(async (req, res) => {
  const { memberId } = req.body;

  if (!memberId) {
    res.status(400);
    throw new Error('Please provide a member ID to add.');
  }

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

  // Check if memberId is a valid user
  const memberUser = await User.findById(memberId);
  if (!memberUser) {
    res.status(404);
    throw new Error('User to be added as a member not found.');
  }

  // Add member if not already present
  if (!project.members.includes(memberId)) {
    project.members.push(memberId);
    await project.save();
    res.status(200).json({
      success: true,
      message: 'Member added successfully!',
      data: project,
    });
  } else {
    res.status(409); // Conflict
    throw new Error('User is already a member of this project.');
  }
});

// @desc    Remove a member from a project (owner only)
// @route   PUT /api/v1/projects/:id/remove-member
// @access  Private
const removeProjectMember = asyncHandler(async (req, res) => {
  const { memberId } = req.body;

  if (!memberId) {
    res.status(400);
    throw new Error('Please provide a member ID to remove.');
  }

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

  // Prevent removing the owner as a member (if owner is forced to be a member)
  if (project.owner.toString() === memberId.toString()) {
    res.status(400);
    throw new Error('Cannot remove project owner from members list via this route.');
  }

  // Remove member
  const initialLength = project.members.length;
  project.members = project.members.filter(
    (member) => member.toString() !== memberId.toString()
  );

  if (project.members.length < initialLength) {
    await project.save();
    res.status(200).json({
      success: true,
      message: 'Member removed successfully!',
      data: project,
    });
  } else {
    res.status(404);
    throw new Error('User is not a member of this project.');
  }
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