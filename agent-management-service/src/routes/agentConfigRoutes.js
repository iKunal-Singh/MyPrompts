const express = require('express');
const agentConfigController = require('../controllers/agentConfigController');
const authMiddleware = require('./authMiddleware'); // Import the middleware
const { check, param } = require('express-validator'); // For basic validation

const router = express.Router();

// Apply the authMiddleware to all routes in this file
router.use(authMiddleware);

// POST /api/v1/agents/user-configs
router.post(
  '/user-configs',
  [
    check('agent_type', 'Agent type is required').not().isEmpty(),
    check('api_key_plain', 'API key is required').not().isEmpty(),
    check('settings', 'Settings must be an object').optional().isObject(),
  ],
  agentConfigController.createOrUpdateUserAgentConfig
);

// GET /api/v1/agents/user-configs
router.get(
  '/user-configs',
  agentConfigController.getUserAgentConfigs
);

// DELETE /api/v1/agents/user-configs/:configId
router.delete(
  '/user-configs/:configId',
  [
    param('configId', 'Invalid Config ID format').isMongoId(), // Validate configId format
  ],
  agentConfigController.deleteUserAgentConfig
);

module.exports = router;
