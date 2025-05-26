const express = require('express');
const { check } = require('express-validator');
const promptController = require('../controllers/promptController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// All prompt routes are protected by the authMiddleware
router.use(authMiddleware);

// POST /api/v1/prompts
// projectId is now expected in the body
router.post(
  '/',
  [
    check('title', 'Prompt title is required').not().isEmpty(),
    check('content', 'Prompt content is required').not().isEmpty(), // HTML or JSON string
    check('projectId', 'Project ID is required').not().isEmpty(),
    check('metadata', 'Metadata must be an object').optional().isObject(),
    check('metadata.tags', 'Metadata tags must be an array').optional().isArray(),
    check('metadata.variables_placeholders', 'Metadata variables must be an array').optional().isArray(),
  ],
  promptController.createPrompt
);

// PUT /api/v1/prompts/:promptId
router.put(
  '/:promptId',
  [
    check('title', 'Prompt title is required').optional().not().isEmpty(),
    check('content', 'Prompt content is required').optional().not().isEmpty(),
    check('metadata', 'Metadata must be an object').optional().isObject(),
    check('metadata.tags', 'Metadata tags must be an array').optional().isArray(),
    check('metadata.variables_placeholders', 'Metadata variables must be an array').optional().isArray(),
  ],
  promptController.updatePrompt
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

// GET /api/v1/prompts/:promptId/versions
router.get(
  '/:promptId/versions',
  promptController.getPromptVersions
);

// POST /api/v1/prompts/:promptId/revert/:versionNumber
router.post(
  '/:promptId/revert/:versionNumber',
  // No specific body validation here, params are used by controller
  promptController.revertToVersion 
);

module.exports = router;
