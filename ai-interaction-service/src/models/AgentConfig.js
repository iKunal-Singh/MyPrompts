const mongoose = require('mongoose');

const AgentConfigSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming a User model exists in your ecosystem
    required: true,
    index: true,
  },
  agent_type: {
    type: String,
    required: true,
    enum: ["OpenAI-GPT-4", "Anthropic-Claude-2", "DALL·E 3", "Gemini-Pro", "Other"], // Added 'Other'
  },
  api_key_encrypted: {
    type: String,
    required: true,
  },
  settings: {
    type: mongoose.Schema.Types.Mixed, // For flexible agent-specific settings
    default: {},
  },
  status: {
    type: String,
    default: "active",
    enum: ["active", "inactive", "key_error"],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save middleware to update `updated_at`
AgentConfigSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

// Pre-findOneAndUpdate middleware to update `updated_at`
AgentConfigSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updated_at: new Date() });
  next();
});

// Compound index to ensure a user has only one config per agent type
AgentConfigSchema.index({ userId: 1, agent_type: 1 }, { unique: true });


module.exports = mongoose.model('AgentConfig', AgentConfigSchema);
