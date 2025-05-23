const { validationResult } = require('express-validator');

// In-memory store for prompts
const prompts = [];
let promptIdCounter = 1;

// This is a placeholder. In a real app, you might call Project Service
// or ensure the project_id from the header is valid for the given user_id.
// For now, we'll assume if x-project-id is passed, it's valid for the user.
const isValidProjectForUser = (projectId, userId) => {
  // console.log(`Validating projectId: ${projectId} for userId: ${userId}`);
  // Placeholder: In a real system, this would involve a lookup.
  // For now, just ensure they are present.
  return projectId && userId;
};

// POST /api/v1/prompts
// (Assumes x-project-id header is present for associating with a project)
exports.createPrompt = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, content } = req.body;
  const userId = req.userId; // Attached by authMiddleware
  const projectId = req.projectIdFromHeader; // Attached by authMiddleware from x-project-id header

  if (!projectId) {
    return res.status(400).json({ msg: 'Missing x-project-id header' });
  }

  if (!isValidProjectForUser(projectId, userId)) {
    return res.status(403).json({ msg: 'User does not have access to this project or project is invalid.' });
  }

  try {
    const newPrompt = {
      id: promptIdCounter++,
      userId: parseInt(userId),
      projectId: parseInt(projectId),
      title,
      content,
      createdAt: new Date(),
    };
    prompts.push(newPrompt);
    res.status(201).json(newPrompt);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// GET /api/v1/projects/{projectId}/prompts
exports.getPromptsByProject = (req, res) => {
  const userId = req.userId; // Attached by authMiddleware
  const { projectId } = req.params;

  if (!isValidProjectForUser(projectId, userId)) {
    return res.status(403).json({ msg: 'User does not have access to this project or project is invalid.' });
  }

  try {
    const projectPrompts = prompts.filter(
      (prompt) => prompt.projectId === parseInt(projectId) && prompt.userId === parseInt(userId)
    );
    res.json(projectPrompts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// GET /api/v1/prompts/{promptId}
exports.getPromptById = (req, res) => {
  const userId = req.userId; // Attached by authMiddleware
  const { promptId } = req.params;

  try {
    const prompt = prompts.find(
      (p) => p.id === parseInt(promptId) && p.userId === parseInt(userId)
    );

    if (!prompt) {
      return res.status(404).json({ msg: 'Prompt not found or user does not have access' });
    }
    // Further check if this prompt belongs to a project the user has access to could be added if needed
    // For now, if the prompt's userId matches, we assume access.
    res.json(prompt);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
