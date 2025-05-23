const mongoose = require('mongoose');

const PromptVersionSchema = new mongoose.Schema({
  promptId: { // ID of the main/parent prompt document
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prompt',
    required: true,
    index: true,
  },
  version_number: { // The version number this entry represents
    type: Number,
    required: true,
  },
  title: { // Title at the time of versioning
    type: String,
    required: true,
    trim: true,
  },
  content: { // Tiptap content (HTML or JSON string)
    type: String,
    trim: true,
  },
  metadata: { // Full metadata object at the time of versioning
    tags: [{ type: String, trim: true }],
    model_used: { type: String, trim: true },
    output_type: { type: String, trim: true },
    purpose_use_case: { type: String, trim: true },
    parameters_used: { type: String, trim: true },
    variables_placeholders: [{ type: String, trim:true }],
    expected_output_format_structure: { type: String, trim: true },
    source_reference: { type: String, trim: true },
  },
  created_at: { // Timestamp of when this version was created/archived
    type: Date,
    default: Date.now,
  },
});

// Compound index for efficient lookup of versions for a prompt
PromptVersionSchema.index({ promptId: 1, version_number: -1 }); // -1 for sorting by version_number descending

module.exports = mongoose.model('PromptVersion', PromptVersionSchema);
