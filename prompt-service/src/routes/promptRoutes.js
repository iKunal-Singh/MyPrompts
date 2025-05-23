const express = require('express');
const { check } = require('express-validator');
const promptController = require('../controllers/promptController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// All prompt routes are protected by the authMiddleware
router.use(authMiddleware);

// POST /api/v1/prompts
// This route expects x-project-id in header for association
router.post(
  '/',
  [
    check('title', 'Prompt title is required').not().isEmpty(),
    check('content', 'Prompt content is required').not().isEmpty(),
  ],
  promptController.createPrompt
);

// GET /api/v1/projects/{projectId}/prompts
router.get(
  '/projects/:projectId/prompts',
  promptController.getPromptsByProject
);

// GET /api/v1/prompts/{promptId}
router.get(
  '/:promptId',
  promptController.getPromptById
);

module.exports = router;
