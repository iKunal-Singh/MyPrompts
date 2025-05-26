const AgentConfig = require('../models/AgentConfig');
const { encrypt, decrypt } = require('../utils/encryption');
const mongoose = require('mongoose');

// POST /api/v1/agents/user-configs
// Creates or updates an agent configuration for a user
exports.createOrUpdateUserAgentConfig = async (req, res) => {
  const { agent_type, api_key_plain, settings } = req.body;
  const userIdFromHeader = req.userId; // Assuming this is set by a middleware from x-user-id

  if (!userIdFromHeader) {
    return res.status(400).json({ msg: 'User ID (x-user-id header) is required.' });
  }
  if (!agent_type || !api_key_plain) {
    return res.status(400).json({ msg: 'agent_type and api_key_plain are required.' });
  }

  let userId;
  try {
    userId = new mongoose.Types.ObjectId(userIdFromHeader);
  } catch (error) {
    return res.status(400).json({ msg: 'Invalid User ID format in x-user-id header.' });
  }

  try {
    const api_key_encrypted = encrypt(api_key_plain);
    if (!api_key_encrypted) {
        // This might happen if encryption key is missing, but encryption.js should exit process.
        // Or if api_key_plain was null/undefined and encrypt returns null.
        return res.status(500).json({ msg: 'API key encryption failed. Ensure API key is provided.' });
    }

    const updateData = {
      userId,
      agent_type,
      api_key_encrypted,
      settings: settings || {},
      status: 'active', // Default to active or reactivate on update
    };

    // Upsert logic: find by userId and agent_type, if exists update, else create.
    const options = { upsert: true, new: true, setDefaultsOnInsert: true, select: '-api_key_encrypted' };
    const agentConfig = await AgentConfig.findOneAndUpdate(
      { userId, agent_type },
      updateData,
      options
    );

    res.status(200).json(agentConfig); // Status 200 for update, 201 if you differentiate upsert creation
  } catch (error) {
    console.error('Error in createOrUpdateUserAgentConfig:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ msg: 'Validation Error', errors: error.errors });
    }
    res.status(500).json({ msg: 'Server error while creating/updating agent configuration.' });
  }
};

// GET /api/v1/agents/user-configs
// Fetches all agent configurations for a user, excluding encrypted API keys
exports.getUserAgentConfigs = async (req, res) => {
  const userIdFromHeader = req.userId; // Assuming this is set by a middleware

  if (!userIdFromHeader) {
    return res.status(400).json({ msg: 'User ID (x-user-id header) is required.' });
  }
  
  let userId;
  try {
    userId = new mongoose.Types.ObjectId(userIdFromHeader);
  } catch (error) {
    return res.status(400).json({ msg: 'Invalid User ID format in x-user-id header.' });
  }

  try {
    const agentConfigs = await AgentConfig.find({ userId }).select('-api_key_encrypted');
    res.status(200).json(agentConfigs);
  } catch (error) {
    console.error('Error in getUserAgentConfigs:', error.message);
    res.status(500).json({ msg: 'Server error while fetching agent configurations.' });
  }
};

// DELETE /api/v1/agents/user-configs/:configId
// Deletes a specific agent configuration
exports.deleteUserAgentConfig = async (req, res) => {
  const { configId } = req.params;
  const userIdFromHeader = req.userId; // Assuming this is set by a middleware

  if (!userIdFromHeader) {
    return res.status(400).json({ msg: 'User ID (x-user-id header) is required for authorization.' });
  }
  if (!mongoose.Types.ObjectId.isValid(configId)) {
    return res.status(400).json({ msg: 'Invalid configId format.' });
  }
  
  let userId;
  try {
    userId = new mongoose.Types.ObjectId(userIdFromHeader);
  } catch (error) {
    return res.status(400).json({ msg: 'Invalid User ID format in x-user-id header.' });
  }

  try {
    const agentConfig = await AgentConfig.findById(configId);

    if (!agentConfig) {
      return res.status(404).json({ msg: 'Agent configuration not found.' });
    }

    // Verify ownership
    if (agentConfig.userId.toString() !== userId.toString()) {
      return res.status(403).json({ msg: 'User not authorized to delete this configuration.' });
    }

    await AgentConfig.findByIdAndDelete(configId);
    // await agentConfig.remove(); // findByIdAndDelete is more direct if you don't need pre/post remove hooks on the instance

    res.status(200).json({ msg: 'Agent configuration deleted successfully.' });
  } catch (error) {
    console.error('Error in deleteUserAgentConfig:', error.message);
    res.status(500).json({ msg: 'Server error while deleting agent configuration.' });
  }
};
