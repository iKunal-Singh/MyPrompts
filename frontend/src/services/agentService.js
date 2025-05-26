// Base URL for the API Gateway for agent configurations
// In a real app, this would likely come from an environment variable
const API_AGENT_URL = 'http://localhost:3000/api/v1/agents';

// Helper function for API requests (can be shared if not already)
const request = async (url, method = 'GET', body = null, additionalHeaders = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...additionalHeaders,
    // 'x-user-id': '123', // This is added by the API Gateway
  };

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    if (response.status === 204) { // No Content
        return null;
    }
    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Fetch all agent configurations for the user
export const getUserAgentConfigs = async () => {
  return request(`${API_AGENT_URL}/user-configs`, 'GET');
};

// Create or update an agent configuration
// The backend uses upsert logic based on (userId, agent_type)
export const createOrUpdateAgentConfig = async (agentData) => {
  // agentData should include: agent_type, api_key_plain, settings (optional)
  return request(`${API_AGENT_URL}/user-configs`, 'POST', agentData);
};

// Delete a specific agent configuration
export const deleteAgentConfig = async (configId) => {
  return request(`${API_AGENT_URL}/user-configs/${configId}`, 'DELETE');
};
