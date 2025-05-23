const mongoose = require('mongoose');

const PromptSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  userId: { // Denormalizing userId here for easier lookup
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: { // Will store Tiptap editor content (HTML or JSON string)
    type: String,
    trim: true,
  },
  metadata: {
    tags: [{ type: String, trim: true }],
    model_used: { type: String, trim: true },
    output_type: { type: String, trim: true },
    purpose_use_case: { type: String, trim: true },
    parameters_used: { type: String, trim: true }, // Storing as string, can be JSON.parse'd
    variables_placeholders: [{ type: String, trim:true }],
    expected_output_format_structure: { type: String, trim: true },
    source_reference: { type: String, trim: true },
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  last_modified_at: {
    type: Date,
    default: Date.now,
  },
  current_version_number: { // Indicates the version of the content currently in this document
    type: Number,
    default: 1, // Starts at 1 upon creation
  },
});

// Pre-save middleware to update `last_modified_at`
PromptSchema.pre('save', function (next) {
  this.last_modified_at = Date.now();
  next();
});

// Pre-findOneAndUpdate middleware to update `last_modified_at`
// Mongoose 5.x and earlier: this.update({}, { $set: { last_modified_at: new Date() } });
// Mongoose 6.x and later: this.set({ last_modified_at: new Date() });
PromptSchema.pre('findOneAndUpdate', function(next) {
  this.set({ last_modified_at: new Date() });
  next();
});


module.exports = mongoose.model('Prompt', PromptSchema);
