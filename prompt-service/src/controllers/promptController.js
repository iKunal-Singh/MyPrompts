const { validationResult } = require('express-validator');
const Prompt = require('../models/Prompt'); // Import Prompt model
const PromptVersion = require('../models/PromptVersion'); // Import PromptVersion model
const mongoose = require('mongoose'); // Import mongoose for ObjectId validation

// Placeholder for validating project access.
const isValidProjectForUser = async (projectIdStr, userIdStr) => {
  if (!mongoose.Types.ObjectId.isValid(projectIdStr) || !mongoose.Types.ObjectId.isValid(userIdStr)) {
    return false;
  }
  // In a real app, this would check if projectIdStr exists and userIdStr has permissions.
  // For now, assume valid ObjectId format implies access.
  return true;
};

// POST /api/v1/prompts
exports.createPrompt = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Destructure all expected fields from req.body
  const { title, content, metadata, projectId: projectIdFromBody } = req.body; // projectId from body now
  const userIdFromHeader = req.userId; // Still from authMiddleware via header
  const projectIdFromHeader = req.projectIdFromHeader; // Still from authMiddleware via header

  // Use projectId from body if provided, otherwise fallback to header (less ideal for POST)
  const effectiveProjectId = projectIdFromBody || projectIdFromHeader;

  if (!userIdFromHeader || !effectiveProjectId) {
    return res.status(400).json({ msg: 'Missing x-user-id header or projectId (in body or x-project-id header)' });
  }
  
  if (!mongoose.Types.ObjectId.isValid(userIdFromHeader) || !mongoose.Types.ObjectId.isValid(effectiveProjectId)) {
    return res.status(400).json({ msg: 'Invalid User ID or Project ID format.' });
  }

  const userId = new mongoose.Types.ObjectId(userIdFromHeader);
  const projectId = new mongoose.Types.ObjectId(effectiveProjectId);

  if (!(await isValidProjectForUser(effectiveProjectId, userIdFromHeader))) {
    return res.status(403).json({ msg: 'User does not have access to this project or project is invalid.' });
  }

  try {
    const newPrompt = new Prompt({
      userId,
      projectId,
      title,
      content, // HTML or JSON string from Tiptap
      metadata: { // Sanitize and map metadata
        tags: metadata?.tags || [],
        model_used: metadata?.model_used || '',
        output_type: metadata?.output_type || '',
        purpose_use_case: metadata?.purpose_use_case || '',
        parameters_used: metadata?.parameters_used || '',
        variables_placeholders: metadata?.variables_placeholders || [],
        expected_output_format_structure: metadata?.expected_output_format_structure || '',
        source_reference: metadata?.source_reference || '',
      }
    });

    const prompt = await newPrompt.save();
    res.status(201).json(prompt);
  } catch (err) {
    console.error('Create Prompt Error:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ errors: err.errors });
    }
    res.status(500).send('Server error');
  }
};

// PUT /api/v1/prompts/:promptId
exports.updatePrompt = async (req, res) => {
  const errors = validationResult(req); // Assuming you might add validation for update
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { promptId: promptIdFromParam } = req.params;
  const { title, content, metadata } = req.body;
  const userIdFromHeader = req.userId; // From authMiddleware

  if (!userIdFromHeader || !promptIdFromParam) {
    return res.status(400).json({ msg: 'Missing x-user-id header or promptId path parameter' });
  }

  if (!mongoose.Types.ObjectId.isValid(userIdFromHeader) || !mongoose.Types.ObjectId.isValid(promptIdFromParam)) {
    return res.status(400).json({ msg: 'Invalid User ID or Prompt ID format.' });
  }
  
  const userId = new mongoose.Types.ObjectId(userIdFromHeader);
  const promptId = new mongoose.Types.ObjectId(promptIdFromParam);

  try {
    let prompt = await Prompt.findById(promptId);

    if (!prompt) {
      return res.status(404).json({ msg: 'Prompt not found' });
    }

    // Check if the user owns this prompt
    if (prompt.userId.toString() !== userId.toString()) {
      return res.status(403).json({ msg: 'User not authorized to update this prompt' });
    }
    
    // Update fields
    if (title) prompt.title = title;
    if (content) prompt.content = content; // HTML or JSON string from Tiptap

    if (metadata) {
      prompt.metadata = {
        tags: metadata.tags !== undefined ? metadata.tags : prompt.metadata.tags,
        model_used: metadata.model_used !== undefined ? metadata.model_used : prompt.metadata.model_used,
        output_type: metadata.output_type !== undefined ? metadata.output_type : prompt.metadata.output_type,
        purpose_use_case: metadata.purpose_use_case !== undefined ? metadata.purpose_use_case : prompt.metadata.purpose_use_case,
        parameters_used: metadata.parameters_used !== undefined ? metadata.parameters_used : prompt.metadata.parameters_used,
        variables_placeholders: metadata.variables_placeholders !== undefined ? metadata.variables_placeholders : prompt.metadata.variables_placeholders,
        expected_output_format_structure: metadata.expected_output_format_structure !== undefined ? metadata.expected_output_format_structure : prompt.metadata.expected_output_format_structure,
        source_reference: metadata.source_reference !== undefined ? metadata.source_reference : prompt.metadata.source_reference,
      };
    }
    // last_modified_at is updated by pre('findOneAndUpdate') or pre('save')
    // If using findById and then save():
    prompt = await prompt.save(); 
    // Save the current state as a new version BEFORE updating
    const newVersion = new PromptVersion({
      promptId: prompt._id,
      version_number: prompt.current_version_number, // Version being archived
      title: prompt.title,
      content: prompt.content,
      metadata: prompt.metadata,
      // created_at will default to now for the version
    });
    await newVersion.save();

    // Update fields on the main prompt
    if (title) prompt.title = title;
    if (content) prompt.content = content; 
    if (metadata) {
      prompt.metadata = {
        tags: metadata.tags !== undefined ? metadata.tags : prompt.metadata.tags,
        model_used: metadata.model_used !== undefined ? metadata.model_used : prompt.metadata.model_used,
        output_type: metadata.output_type !== undefined ? metadata.output_type : prompt.metadata.output_type,
        purpose_use_case: metadata.purpose_use_case !== undefined ? metadata.purpose_use_case : prompt.metadata.purpose_use_case,
        parameters_used: metadata.parameters_used !== undefined ? metadata.parameters_used : prompt.metadata.parameters_used,
        variables_placeholders: metadata.variables_placeholders !== undefined ? metadata.variables_placeholders : prompt.metadata.variables_placeholders,
        expected_output_format_structure: metadata.expected_output_format_structure !== undefined ? metadata.expected_output_format_structure : prompt.metadata.expected_output_format_structure,
        source_reference: metadata.source_reference !== undefined ? metadata.source_reference : prompt.metadata.source_reference,
      };
    }
    
    // Increment version number for the main prompt
    prompt.current_version_number += 1;
    // last_modified_at is updated by pre('save') hook on Prompt model
    
    const updatedPrompt = await prompt.save(); 

    res.json(updatedPrompt);
  } catch (err) {
    console.error('Update Prompt Error:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ errors: err.errors });
    }
    res.status(500).send('Server error');
  }
};

// GET /api/v1/prompts/:promptId/versions
exports.getPromptVersions = async (req, res) => {
  const { promptId: promptIdFromParam } = req.params;
  const userIdFromHeader = req.userId; // From authMiddleware

  if (!userIdFromHeader || !promptIdFromParam) {
    return res.status(400).json({ msg: 'Missing x-user-id header or promptId path parameter' });
  }
  if (!mongoose.Types.ObjectId.isValid(userIdFromHeader) || !mongoose.Types.ObjectId.isValid(promptIdFromParam)) {
    return res.status(400).json({ msg: 'Invalid User ID or Prompt ID format.' });
  }

  const promptId = new mongoose.Types.ObjectId(promptIdFromParam);
  const userId = new mongoose.Types.ObjectId(userIdFromHeader);

  try {
    // First, verify the main prompt exists and belongs to the user
    const mainPrompt = await Prompt.findOne({ _id: promptId, userId: userId });
    if (!mainPrompt) {
      return res.status(404).json({ msg: 'Prompt not found or user does not have access.' });
    }

    // Fetch versions, sorted by version_number descending
    const versions = await PromptVersion.find({ promptId: promptId })
                                        .sort({ version_number: -1 });
    res.json(versions);
  } catch (err) {
    console.error('Get Prompt Versions Error:', err.message);
    res.status(500).send('Server error');
  }
};

// POST /api/v1/prompts/:promptId/revert/:versionNumber
exports.revertToVersion = async (req, res) => {
  const { promptId: promptIdFromParam, versionNumber: versionNumberFromParam } = req.params;
  const userIdFromHeader = req.userId; // From authMiddleware

  if (!userIdFromHeader || !promptIdFromParam || !versionNumberFromParam) {
    return res.status(400).json({ msg: 'Missing x-user-id header, promptId, or versionNumber path parameter' });
  }
  if (!mongoose.Types.ObjectId.isValid(userIdFromHeader) || !mongoose.Types.ObjectId.isValid(promptIdFromParam)) {
    return res.status(400).json({ msg: 'Invalid User ID or Prompt ID format.' });
  }
  
  const versionNumber = parseInt(versionNumberFromParam, 10);
  if (isNaN(versionNumber) || versionNumber <= 0) {
    return res.status(400).json({ msg: 'Invalid version number format.' });
  }

  const promptId = new mongoose.Types.ObjectId(promptIdFromParam);
  const userId = new mongoose.Types.ObjectId(userIdFromHeader);
  
  try {
    // Verify the main prompt exists and belongs to the user
    let mainPrompt = await Prompt.findOne({ _id: promptId, userId: userId });
    if (!mainPrompt) {
      return res.status(404).json({ msg: 'Prompt not found or user does not have access.' });
    }

    // Fetch the specific version to revert to
    const versionToRevert = await PromptVersion.findOne({ 
      promptId: promptId, 
      version_number: versionNumber 
    });

    if (!versionToRevert) {
      return res.status(404).json({ msg: 'Specified version not found for this prompt.' });
    }

    // Optional: Archive current state of mainPrompt before reverting
    // This creates a new version from the state *before* revert.
    const preRevertVersion = new PromptVersion({
      promptId: mainPrompt._id,
      version_number: mainPrompt.current_version_number, // Current version of main prompt
      title: mainPrompt.title,
      content: mainPrompt.content,
      metadata: mainPrompt.metadata,
    });
    await preRevertVersion.save();

    // Revert main prompt to the specified version's data
    mainPrompt.title = versionToRevert.title;
    mainPrompt.content = versionToRevert.content;
    mainPrompt.metadata = versionToRevert.metadata;
    // Set current_version_number to the version number we are reverting TO.
    // Or, if we consider the revert itself an action that creates a new version, increment.
    // For "current_version_number always points to the version currently active":
    // The content is now that of `versionToRevert.version_number`.
    // However, because we archived its previous state as `mainPrompt.current_version_number`,
    // the next logical version for the main prompt (which now holds reverted content) should be higher.
    mainPrompt.current_version_number += 1; // Increment, as revert is a new state.
    // mainPrompt.last_modified_at will be updated by pre-save hook

    const revertedPrompt = await mainPrompt.save();
    res.json(revertedPrompt);

  } catch (err) {
    console.error('Revert To Version Error:', err.message);
    res.status(500).send('Server error');
  }
};


// GET /api/v1/projects/{projectId}/prompts
exports.getPromptsByProject = async (req, res) => {
  const userIdFromHeader = req.userId; 
  const projectIdFromParam = req.params.projectId;

  if (!userIdFromHeader || !projectIdFromParam) {
    return res.status(400).json({ msg: 'Missing x-user-id header or projectId path parameter' });
  }

  if (!mongoose.Types.ObjectId.isValid(userIdFromHeader) || !mongoose.Types.ObjectId.isValid(projectIdFromParam)) {
    return res.status(400).json({ msg: 'Invalid User ID or Project ID format.' });
  }
  
  const userId = new mongoose.Types.ObjectId(userIdFromHeader);
  const projectId = new mongoose.Types.ObjectId(projectIdFromParam);

  if (!(await isValidProjectForUser(projectIdFromParam, userIdFromHeader))) {
    return res.status(403).json({ msg: 'User does not have access to this project or project is invalid.' });
  }

  try {
    const projectPrompts = await Prompt.find({ projectId: projectId, userId: userId });
    res.json(projectPrompts);
  } catch (err) {
    console.error('Get Prompts by Project Error:', err.message);
    res.status(500).send('Server error');
  }
};

// GET /api/v1/prompts/{promptId}
exports.getPromptById = async (req, res) => {
  const userIdFromHeader = req.userId; 
  const promptIdFromParam = req.params.promptId;

  if (!userIdFromHeader || !promptIdFromParam) {
    return res.status(400).json({ msg: 'Missing x-user-id header or promptId path parameter' });
  }

  if (!mongoose.Types.ObjectId.isValid(userIdFromHeader) || !mongoose.Types.ObjectId.isValid(promptIdFromParam)) {
    return res.status(400).json({ msg: 'Invalid User ID or Prompt ID format.' });
  }

  const userId = new mongoose.Types.ObjectId(userIdFromHeader);
  const promptId = new mongoose.Types.ObjectId(promptIdFromParam);
  
  try {
    const prompt = await Prompt.findOne({ _id: promptId, userId: userId });

    if (!prompt) {
      return res.status(404).json({ msg: 'Prompt not found or user does not have access' });
    }
    // Ensure full metadata is returned (Mongoose does this by default)
    res.json(prompt);
  } catch (err) {
    console.error('Get Prompt by ID Error:', err.message);
    res.status(500).send('Server error');
  }
};
