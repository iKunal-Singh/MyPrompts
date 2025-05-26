import React, { useState, useEffect } from 'react';
import './MetadataPanel.css';

const MetadataPanel = ({ initialMetadata, onMetadataChange }) => {
  // Initialize state with props, allowing it to be controlled or uncontrolled-like
  const [tags, setTags] = useState(initialMetadata.tags.join(', ')); // Join for text input
  const [modelUsed, setModelUsed] = useState(initialMetadata.model_used);
  const [outputType, setOutputType] = useState(initialMetadata.output_type);
  const [purpose, setPurpose] = useState(initialMetadata.purpose_use_case);
  const [parameters, setParameters] = useState(initialMetadata.parameters_used);
  const [variables, setVariables] = useState(initialMetadata.variables_placeholders.join(', ')); // Join for text input
  const [expectedOutput, setExpectedOutput] = useState(initialMetadata.expected_output_format_structure);
  const [source, setSource] = useState(initialMetadata.source_reference);

  // Read-only values from initialMetadata (if available, e.g., after loading)
  const lastModified = initialMetadata.last_modified_at ? new Date(initialMetadata.last_modified_at).toLocaleString() : "Not yet saved";
  const created = initialMetadata.created_at ? new Date(initialMetadata.created_at).toLocaleString() : "Not yet saved";

  // Effect to update local state if initialMetadata prop changes (e.g., after loading a prompt)
  useEffect(() => {
    setTags(initialMetadata.tags.join(', '));
    setModelUsed(initialMetadata.model_used || 'GPT-4');
    setOutputType(initialMetadata.output_type || 'Text');
    setPurpose(initialMetadata.purpose_use_case || '');
    setParameters(initialMetadata.parameters_used || '');
    setVariables(initialMetadata.variables_placeholders.join(', '));
    setExpectedOutput(initialMetadata.expected_output_format_structure || '');
    setSource(initialMetadata.source_reference || '');
  }, [initialMetadata]);

  // Generic handler to update parent state
  const handleChange = (field, value) => {
    // For tags and variables, we'll pass them as arrays to the parent
    if (field === 'tags' || field === 'variables_placeholders') {
      onMetadataChange({ [field]: value.split(',').map(item => item.trim()).filter(Boolean) });
    } else {
      onMetadataChange({ [field]: value });
    }
  };
  
  // Specific handlers for local state and then call generic handler
  const handleTagsChange = (e) => {
    setTags(e.target.value);
    handleChange('tags', e.target.value);
  };
  const handleModelUsedChange = (e) => {
    setModelUsed(e.target.value);
    handleChange('model_used', e.target.value);
  };
  const handleOutputTypeChange = (e) => {
    setOutputType(e.target.value);
    handleChange('output_type', e.target.value);
  };
  const handlePurposeChange = (e) => {
    setPurpose(e.target.value);
    handleChange('purpose_use_case', e.target.value);
  };
  const handleParametersChange = (e) => {
    setParameters(e.target.value);
    handleChange('parameters_used', e.target.value);
  };
  const handleVariablesChange = (e) => {
    setVariables(e.target.value);
    handleChange('variables_placeholders', e.target.value);
  };
  const handleExpectedOutputChange = (e) => {
    setExpectedOutput(e.target.value);
    handleChange('expected_output_format_structure', e.target.value);
  };
  const handleSourceChange = (e) => {
    setSource(e.target.value);
    handleChange('source_reference', e.target.value);
  };


  return (
    <aside className="metadata-panel">
      <h3 className="metadata-panel-title">Prompt Metadata</h3>
      
      <div className="metadata-field">
        <label htmlFor="tags">Tags (comma-separated)</label>
        <input
          type="text"
          id="tags"
          value={tags}
          onChange={handleTagsChange}
          placeholder="e.g., marketing, summarization"
        />
      </div>

      <div className="metadata-field">
        <label htmlFor="modelUsed">Model Used</label>
        <select id="modelUsed" value={modelUsed} onChange={handleModelUsedChange}>
          <option value="GPT-4">GPT-4</option>
          <option value="GPT-3.5-Turbo">GPT-3.5-Turbo</option>
          <option value="Claude-2">Claude-2</option>
          <option value="Claude-3-Opus">Claude-3-Opus</option>
          <option value="DALL·E 3">DALL·E 3</option>
          <option value="Gemini-Pro">Gemini-Pro</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="metadata-field">
        <label htmlFor="outputType">Prompt Output Type</label>
        <select id="outputType" value={outputType} onChange={handleOutputTypeChange}>
          <option value="Text">Text</option>
          <option value="Image">Image</option>
          <option value="Code">Code</option>
          <option value="JSON">JSON</option>
          <option value="XML">XML</option>
          <option value="List">List</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="metadata-field">
        <label htmlFor="purpose">Purpose/Use-Case</label>
        <textarea
          id="purpose"
          value={purpose}
          onChange={handlePurposeChange}
          rows={3}
          placeholder="Main goal or application."
        />
      </div>
      
      <div className="metadata-field">
        <label htmlFor="variables">Variables/Placeholders (comma-separated)</label>
        <input
          type="text"
          id="variables"
          value={variables}
          onChange={handleVariablesChange}
          placeholder="e.g., {{product_name}}, {{user_query}}"
        />
      </div>

      <div className="metadata-field">
        <label htmlFor="parameters">Parameters Used (JSON format recommended)</label>
        <textarea
          id="parameters"
          value={parameters}
          onChange={handleParametersChange}
          rows={3}
          placeholder={'e.g., {\n  "temperature": 0.7,\n  "max_tokens": 150\n}'}
        />
      </div>

      <div className="metadata-field">
        <label htmlFor="expectedOutput">Expected Output Format/Structure</label>
        <textarea
          id="expectedOutput"
          value={expectedOutput}
          onChange={handleExpectedOutputChange}
          rows={3}
          placeholder="e.g., A JSON schema, a list of bullet points."
        />
      </div>

      <div className="metadata-field">
        <label htmlFor="source">Source/Reference</label>
        <input
          type="text"
          id="source"
          value={source}
          onChange={handleSourceChange}
          placeholder="e.g., URL, document name"
        />
      </div>
      
      <div className="metadata-section-divider"></div>

      <div className="metadata-field read-only-field">
        <label>Last Modified</label>
        <span>{lastModified}</span>
      </div>
      <div className="metadata-field read-only-field">
        <label>Created</label>
        <span>{created}</span>
      </div>
    </aside>
  );
};

export default MetadataPanel;
