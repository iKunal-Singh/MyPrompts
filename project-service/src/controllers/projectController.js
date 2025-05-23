const { validationResult } = require('express-validator');

// In-memory store for projects
const projects = [];
let projectIdCounter = 1;

// POST /api/v1/projects
exports.createProject = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, project_type_tag } = req.body;
  const userId = req.userId; // Attached by authMiddleware

  try {
    const newProject = {
      id: projectIdCounter++,
      userId: parseInt(userId), // Ensure userId is stored as a number if that's the expectation
      name,
      description,
      project_type_tag,
      createdAt: new Date(),
    };
    projects.push(newProject);
    res.status(201).json(newProject);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// GET /api/v1/projects
exports.getProjects = (req, res) => {
  const userId = req.userId; // Attached by authMiddleware

  try {
    const userProjects = projects.filter(
      (project) => project.userId === parseInt(userId)
    );
    res.json(userProjects);
  } catch (err)
    {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Helper to get project by ID (used by Prompt Service potentially, or future Project Service GET /projects/:id)
exports.getProjectById = (projectId, userId) => {
    return projects.find(p => p.id === parseInt(projectId) && p.userId === parseInt(userId));
};
