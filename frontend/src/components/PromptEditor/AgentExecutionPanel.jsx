import React, { useState, useEffect, useCallback } from 'react';
import { getUserAgentConfigs } from '../../services/agentService';
import { executePrompt } from '../../services/aiInteractionService';
import './PromptEditor.css'; // Assuming styles will be added here or a new CSS file

const AGENT_PARAMETERS = {
  "OpenAI-GPT-4": [
    { name: "temperature", type: "number", default: 0.7, label: "Temperature", step: 0.1 },
    { name: "max_tokens", type: "number", default: 256, label: "Max Tokens" }
  ],
  "OpenAI-GPT-3.5-Turbo": [ // Assuming similar params as GPT-4 for now
    { name: "temperature", type: "number", default: 0.7, label: "Temperature", step: 0.1 },
    { name: "max_tokens", type: "number", default: 256, label: "Max Tokens" }
  ],
  "Anthropic-Claude-2": [
    { name: "temperature", type: "number", default: 0.7, label: "Temperature", step: 0.1 },
    { name: "max_tokens_to_sample", type: "number", default: 1024, label: "Max Tokens to Sample" },
    { name: "top_k", type: "number", default: null, label: "Top K (optional)" },
    { name: "top_p", type: "number", default: null, label: "Top P (optional)", step: 0.01 },
  ],
  "Anthropic-Claude-Instant": [ // Assuming similar params as Claude-2
    { name: "temperature", type: "number", default: 0.7, label: "Temperature", step: 0.1 },
    { name: "max_tokens_to_sample", type: "number", default: 1024, label: "Max Tokens to Sample" },
    { name: "top_k", type: "number", default: null, label: "Top K (optional)" },
    { name: "top_p", type: "number", default: null, label: "Top P (optional)", step: 0.01 },
  ],
  "Google Gemini-Pro": [ // Corrected name based on typical usage
    { name: "temperature", type: "number", default: 0.7, label: "Temperature", step: 0.1 },
    { name: "maxOutputTokens", type: "number", default: 1024, label: "Max Output Tokens" }, // Gemini uses maxOutputTokens
    { name: "topK", type: "number", default: null, label: "Top K (optional)" },
    { name: "topP", type: "number", default: null, label: "Top P (optional)", step: 0.01 },
  ],
  "DALL-E-3": [
    { name: "n", type: "number", default: 1, label: "Number of Images", min: 1, step: 1 },
    { name: "size", type: "select", options: ["1024x1024", "1792x1024", "1024x1792"], default: "1024x1024", label: "Size" },
    { name: "quality", type: "select", options: ["standard", "hd"], default: "standard", label: "Quality" },
    { name: "style", type: "select", options: ["vivid", "natural"], default: "vivid", label: "Style" },
  ],
  "DALL-E-2": [ // Assuming similar params as DALL-E-3, though DALL-E 2 might have different size options or fewer params
    { name: "n", type: "number", default: 1, label: "Number of Images", min: 1, step: 1 },
    { name: "size", type: "select", options: ["256x256", "512x512", "1024x1024"], default: "1024x1024", label: "Size" },
    // DALL-E 2 does not have 'quality' or 'style' params in the same way as DALL-E 3.
    // These might be implicitly 'standard' and 'vivid' or not applicable.
    // For simplicity, we'll keep them but note they might not be used by the backend for DALL-E 2.
  ],
  // Add other agent types and their parameters here as needed
};


const AgentExecutionPanel = ({ editor, promptId, currentVariables }) => {
  const [selectedAgentConfigId, setSelectedAgentConfigId] = useState('');
  const [agentConfigs, setAgentConfigs] = useState([]);
  const [promptOverrideParams, setPromptOverrideParams] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [error, setError] = useState('');
  const [currentAgentType, setCurrentAgentType] = useState('');


  // Fetch agent configurations on component mount
  useEffect(() => {
    const fetchAgents = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await getUserAgentConfigs();
        const configs = response.data || [];
        setAgentConfigs(configs);
        if (configs.length > 0) {
          // setSelectedAgentConfigId(configs[0]._id); // Auto-select first agent
        } else {
          setError('No agent configurations found for your account.');
        }
      } catch (err) {
        console.error('Failed to fetch agent configurations:', err);
        setError(`Failed to load agent configurations: ${err.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgents();
  }, []);

  // Effect to update promptOverrideParams when selectedAgentConfigId changes
  useEffect(() => {
    if (!selectedAgentConfigId) {
      setPromptOverrideParams({});
      setCurrentAgentType('');
      return;
    }

    const selectedConfig = agentConfigs.find(agent => agent._id === selectedAgentConfigId);
    if (selectedConfig && selectedConfig.agent_type) {
      setCurrentAgentType(selectedConfig.agent_type);
      const paramsForAgent = AGENT_PARAMETERS[selectedConfig.agent_type];
      if (paramsForAgent) {
        const defaultParams = paramsForAgent.reduce((acc, param) => {
          if (param.default !== undefined && param.default !== null) { // Ensure default is explicitly set
            acc[param.name] = param.default;
          } else if (param.type === 'number' && param.default === null) { // Explicitly null for optional numbers
             acc[param.name] = ''; // Or undefined, depending on how backend handles empty optional numbers
          } else if (param.type === 'select' && param.options && param.options.length > 0 && param.default === undefined) {
            // If no explicit default for select, use first option
            // acc[param.name] = param.options[0]; 
          }
          // For params without a default, they won't be in the initial override object,
          // which is fine if the backend handles them as optional.
          // Or, you can initialize them to empty string / null if preferred.
          return acc;
        }, {});
        setPromptOverrideParams(defaultParams);
      } else {
        setPromptOverrideParams({}); // No defined parameters for this agent type
      }
    } else {
      setPromptOverrideParams({}); // Reset if no agent selected or type unknown
      setCurrentAgentType('');
    }
  }, [selectedAgentConfigId, agentConfigs]);


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target; // Added 'checked' for potential checkbox params
    setPromptOverrideParams(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : parseFloat(value)) : value),
    }));
  };

  const handleExecute = useCallback(async () => {
    if (!editor) {
      setError('Editor instance is not available.');
      return;
    }
    if (!promptId) {
      setError('Prompt ID is not available. Please save the prompt first.');
      return;
    }
    if (!selectedAgentConfigId) {
      setError('Please select an agent configuration.');
      return;
    }

    setIsLoading(true);
    setExecutionResult(null);
    setError('');

    const promptContent = editor.getText(); // Or editor.getHTML() if HTML is preferred
    // For now, currentVariables is passed as a prop.
    // In a more complex setup, this might come from a shared state or another panel.

    try {
      const result = await executePrompt(promptId, selectedAgentConfigId, promptOverrideParams, currentVariables);
      setExecutionResult(result.response); // Assuming the response structure is { response: "AI output" }
    } catch (err) {
      console.error('Error executing prompt:', err);
      setError(`Execution failed: ${err.message || 'Unknown error'}. ${err.details ? JSON.stringify(err.details) : ''}`);
      if (err.provider_error) {
        setError(prevError => `${prevError} Provider error: ${JSON.stringify(err.provider_error)}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [editor, promptId, selectedAgentConfigId, promptOverrideParams, currentVariables]);

  const selectedAgent = agentConfigs.find(agent => agent._id === selectedAgentConfigId);

  return (
    <div className="agent-execution-panel">
      <h4>Execute with Agent</h4>
      {isLoading && !agentConfigs.length && <p>Loading agent configurations...</p>}
      {error && <p className="error-message">{error}</p>}
      
      <div className="form-group">
        <label htmlFor="agentConfigSelect">Select Agent:</label>
        <select
          id="agentConfigSelect"
          value={selectedAgentConfigId}
          onChange={(e) => setSelectedAgentConfigId(e.target.value)}
          disabled={isLoading || agentConfigs.length === 0}
        >
          <option value="">
            {isLoading ? 'Loading...' : (agentConfigs.length === 0 ? 'No agents available' : 'Select an Agent')}
          </option>
          {agentConfigs.map(agent => (
            <option key={agent._id} value={agent._id}>
              {agent.agent_name} ({agent.agent_type})
            </option>
          ))}
        </select>
      </div>

      {currentAgentType && AGENT_PARAMETERS[currentAgentType] && (
        <div className="agent-params-container">
          <h5>Override Parameters for {currentAgentType}</h5>
          {AGENT_PARAMETERS[currentAgentType].map(param => (
            <div className="form-group" key={param.name}>
              <label htmlFor={param.name}>{param.label || param.name}:</label>
              {param.type === 'select' ? (
                <select
                  id={param.name}
                  name={param.name}
                  value={promptOverrideParams[param.name] || param.default || ''}
                  onChange={handleInputChange}
                >
                  {param.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={param.type}
                  id={param.name}
                  name={param.name}
                  value={promptOverrideParams[param.name] === undefined ? (param.default === null ? '' : (param.default || '')) : promptOverrideParams[param.name]}
                  onChange={handleInputChange}
                  step={param.step}
                  min={param.min}
                  max={param.max}
                  placeholder={param.default !== undefined && param.default !== null ? String(param.default) : (param.type === 'number' ? 'Optional' : '')}
                />
              )}
            </div>
          ))}
        </div>
      )}
      
      <button type="button" onClick={handleExecute} disabled={isLoading || !selectedAgentConfigId || !promptId}>
        {isLoading ? 'Executing...' : 'Execute Prompt'}
      </button>

      {executionResult && (
        <div className="execution-result">
          <h5>Execution Result:</h5>
          {currentAgentType && (currentAgentType.toLowerCase().includes('dall-e') || currentAgentType.toLowerCase().includes('image'))) ? (
            Array.isArray(executionResult) ? (
              executionResult.map((url, index) => (
                <img key={index} src={url} alt={`Generated image ${index + 1}`} className="generated-image" />
              ))
            ) : (
              <img src={executionResult} alt="Generated image" className="generated-image" />
            )
          ) : (
            <pre>{typeof executionResult === 'object' ? JSON.stringify(executionResult, null, 2) : executionResult}</pre>
          )}
        </div>
      )}
    </div>
  );
};

export default AgentExecutionPanel;
