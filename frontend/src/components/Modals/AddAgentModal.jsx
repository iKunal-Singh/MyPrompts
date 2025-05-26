import React, { useState } from 'react';
import './AddAgentModal.css'; // We will create this CSS file next

const AddAgentModal = ({ isOpen, onClose, onSave, existingAgentConfig }) => {
  const [agentType, setAgentType] = useState(existingAgentConfig?.agent_type || 'OpenAI-GPT-4');
  const [apiKey, setApiKey] = useState(''); // Always empty for security, user must re-enter
  const [settings, setSettings] = useState(
    existingAgentConfig?.settings ? JSON.stringify(existingAgentConfig.settings, null, 2) : '{}'
  );
  const [error, setError] = useState('');

  // Effect to reset/populate form when existingAgentConfig changes (or modal opens for edit)
  useState(() => {
    if (existingAgentConfig) {
      setAgentType(existingAgentConfig.agent_type);
      setSettings(JSON.stringify(existingAgentConfig.settings || {}, null, 2));
      setApiKey(''); // API key is never pre-filled
    } else {
      // Reset for new agent
      setAgentType('OpenAI-GPT-4');
      setSettings('{}');
      setApiKey('');
    }
  }, [existingAgentConfig, isOpen]);


  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    if (!apiKey && !existingAgentConfig) { // API key is required for new agents
      setError('API Key is required for new agents.');
      return;
    }

    let parsedSettings;
    try {
      parsedSettings = JSON.parse(settings);
    } catch (jsonError) {
      setError('Settings must be valid JSON.');
      return;
    }

    const agentData = {
      agent_type: agentType,
      api_key_plain: apiKey, // Send empty string if not changed for existing config
      settings: parsedSettings,
    };
    
    // If it's an update and API key is left blank, don't send api_key_plain
    // The backend should be designed to ignore api_key_plain if empty for updates
    // or handle it by not re-encrypting an empty string.
    // For this implementation, if API key is blank on an "edit", we assume it's not being updated.
    // The backend's createOrUpdate will handle the logic.
    if (existingAgentConfig && !apiKey) {
      delete agentData.api_key_plain; // Don't send key if not changing
    }


    onSave(agentData);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-button" aria-label="Close modal">&times;</button>
        <h3>{existingAgentConfig ? 'Edit Agent Configuration' : 'Add New Agent'}</h3>
        {error && <p className="modal-error">{error}</p>}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="agentType">Agent Type</label>
            <select 
              id="agentType" 
              value={agentType} 
              onChange={(e) => setAgentType(e.target.value)}
              disabled={!!existingAgentConfig} // Disable if editing, type shouldn't change
            >
              <option value="OpenAI-GPT-4">OpenAI-GPT-4</option>
              <option value="Anthropic-Claude-2">Anthropic-Claude-2</option>
              <option value="DALL·E 3">DALL·E 3</option>
              <option value="Gemini-Pro">Gemini-Pro</option>
              <option value="Other">Other (Specify in settings if needed)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="apiKey">API Key</label>
            <input
              type="password" // Use password type for better security
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={existingAgentConfig ? "Enter new key to update" : "Enter API Key"}
            />
            {existingAgentConfig && <small>Leave blank to keep existing key.</small>}
          </div>

          <div className="form-group">
            <label htmlFor="settings">Settings (JSON format)</label>
            <textarea
              id="settings"
              rows="4"
              value={settings}
              onChange={(e) => setSettings(e.target.value)}
              placeholder='e.g., {"model": "gpt-4-turbo", "temperature": 0.7}'
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              {existingAgentConfig ? 'Update Agent' : 'Save Agent'}
            </button>
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAgentModal;
