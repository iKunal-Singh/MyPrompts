const { validationResult } = require('express-validator');
const Project = require('../models/Project'); // Import Project model
const mongoose = require('mongoose'); // Import mongoose for ObjectId validation

// POST /api/v1/projects
exports.createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, project_type_tag } = req.body;
  const userIdFromHeader = req.userId; // Attached by authMiddleware

  try {
    // In a real scenario, userIdFromHeader would be validated or converted to ObjectId
    // For now, we'll assume it's a string that can be used for direct storage if not using ref properly
    // However, schema expects ObjectId, so we should try to make it valid if possible, or adjust schema if it's always a string.
    // For this step, we'll assume the provided 'x-user-id' is a string that needs to be stored.
    // If 'User' service creates users with MongoDB's ObjectId, then 'x-user-id' MUST be that ObjectId.
    // Let's assume for now that `userIdFromHeader` is a string representation of an ObjectId.
    // A proper implementation would have the API gateway pass the actual ObjectId of the user.

    if (!userIdFromHeader) {
        return res.status(401).json({ msg: 'User ID not found in request' });
    }
    
    // Attempt to convert to ObjectId if your user IDs are ObjectIds.
    // If your user IDs are simple strings from a previous system, this might not be necessary
    // or you might need a different strategy for foreign keys.
    // For now, let's assume userIdFromHeader is a valid ObjectId string.
    let userId;
    try {
        userId = new mongoose.Types.ObjectId(userIdFromHeader);
    } catch (error) {
        // If it's not a valid ObjectId string, and your system uses ObjectIds for users.
        // This indicates an issue with the x-user-id header value.
        // console.warn(`Invalid x-user-id format: ${userIdFromHeader}. Storing as string if schema allows, or this will fail.`);
        // If your User model's _id is an ObjectId, then `userId` field here MUST be an ObjectId.
        return res.status(400).json({ msg: 'Invalid User ID format in x-user-id header.' });
    }


    const newProject = new Project({
      userId, // This should be a valid ObjectId if ref: 'User' is used strictly
      name,
      description,
      project_type_tag,
    });

    const project = await newProject.save();
    res.status(201).json(project);
  } catch (err) {
    console.error('Create Project Error:', err.message);
    // Check for specific Mongoose errors if needed
    if (err.name === 'ValidationError') {
      return res.status(400).json({ errors: err.errors });
    }
    res.status(500).send('Server error');
  }
};

// GET /api/v1/projects
exports.getProjects = async (req, res) => {
  const userIdFromHeader = req.userId; // Attached by authMiddleware

  try {
    // As above, assuming userIdFromHeader is a string representation of an ObjectId for querying.
     if (!userIdFromHeader) {
        return res.status(401).json({ msg: 'User ID not found in request' });
    }
    let userIdQuery;
    try {
        userIdQuery = new mongoose.Types.ObjectId(userIdFromHeader);
    } catch (error) {
        return res.status(400).json({ msg: 'Invalid User ID format in x-user-id header for querying.' });
    }

    const userProjects = await Project.find({ userId: userIdQuery });
    res.json(userProjects);
  } catch (err) {
    console.error('Get Projects Error:', err.message);
    res.status(500).send('Server error');
  }
};

// Helper to get project by ID (can be enhanced or used internally)
// Not directly exposed as a route in this controller based on current requirements
exports.getProjectByIdInternal = async (projectId, userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(projectId) || (userId && !mongoose.Types.ObjectId.isValid(userId))) {
      return null; // Invalid ID format
    }
    const query = { _id: projectId };
    if (userId) {
      query.userId = userId; // Ensure project belongs to the user
    }
    return await Project.findOne(query);
  } catch (error) {
    console.error('Error fetching project by ID internal:', error.message);
    return null;
  }
};
