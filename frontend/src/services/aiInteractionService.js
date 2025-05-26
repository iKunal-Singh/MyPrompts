import axios from 'axios';

// TODO: Make API_BASE_URL configurable, potentially from .env
const API_BASE_URL = 'http://localhost:3003/api/v1'; // Assuming ai-interaction-service runs on 3003 for now

const request = async (method, endpoint, data = null, params = null, headers = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token'); // Assuming token-based auth, handled by gateway potentially
  const effectiveHeaders = { ...headers };
  if (token) {
    effectiveHeaders['Authorization'] = `Bearer ${token}`;
  }
  // The x-user-id header is assumed to be added by the API Gateway or automatically handled
  // based on the authentication token. If direct client-side setting is needed, it would be added here.

  try {
    const response = await axios({
      method,
      url,
      data,
      params,
      headers: effectiveHeaders,
    });
    return response.data;
  } catch (error) {
    console.error(`API request error to ${endpoint}:`, error.response || error.message);
    throw error.response ? error.response.data : new Error('Network error or no response');
  }
};

/**
 * Executes a prompt with the given parameters.
 * @param {string} promptId - The ID of the prompt to execute.
 * @param {string} agentConfigId - The ID of the agent configuration to use.
 * @param {object} promptOverrideParams - Parameters to override agent settings (e.g., temperature, max_tokens).
 * @param {object} variables - Key-value pairs for replacing placeholders in the prompt template.
 * @returns {Promise<object>} The result of the prompt execution.
 */
export const executePrompt = async (promptId, agentConfigId, promptOverrideParams, variables) => {
  if (!promptId) {
    throw new Error('promptId is required for executing a prompt.');
  }
  if (!agentConfigId) {
    throw new Error('agentConfigId is required for executing a prompt.');
  }

  const body = {
    agent_config_id: agentConfigId,
    prompt_override_params: promptOverrideParams || {},
    variables: variables || {},
  };

  return request('POST', `/prompts/${promptId}/execute`, body);
};
