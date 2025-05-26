// Base URL for the API Gateway
// In a real app, this would likely come from an environment variable
const API_BASE_URL = 'http://localhost:3000/api/v1';

// Helper function for API requests
const request = async (url, method = 'GET', body = null, additionalHeaders = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...additionalHeaders,
    // 'x-user-id': '123', // This is now added by the API Gateway, so not needed here
    // 'x-project-id': passed in additionalHeaders if needed for specific calls
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

export const createPrompt = async (promptData) => {
  // promptData should include: title, content, metadata, and projectId
  // The x-user-id header is added by the API gateway.
  // If x-project-id header was still needed for some reason (e.g. if not in body):
  // return request(`${API_BASE_URL}/prompts`, 'POST', promptData, { 'x-project-id': promptData.projectId });
  return request(`${API_BASE_URL}/prompts`, 'POST', promptData);
};

export const updatePrompt = async (promptId, promptData) => {
  // promptData typically includes: title, content, metadata
  // userId and projectId usually don't change or are validated on backend
  return request(`${API_BASE_URL}/prompts/${promptId}`, 'PUT', promptData);
};

export const getPrompt = async (promptId) => {
  // The x-user-id header is added by the API gateway for authorization context.
  return request(`${API_BASE_URL}/prompts/${promptId}`, 'GET');
};

// Example of how to get prompts for a project (if needed in future)
export const getPromptsByProject = async (projectId) => {
  // The x-user-id header is added by the API gateway.
  // The projectId is part of the URL.
  return request(`${API_BASE_URL}/projects/${projectId}/prompts`, 'GET');
};

export const getPromptVersions = async (promptId) => {
  // The x-user-id header is added by the API gateway.
  return request(`${API_BASE_URL}/prompts/${promptId}/versions`, 'GET');
};

export const revertToVersion = async (promptId, versionNumber) => {
  // The x-user-id header is added by the API gateway.
  return request(`${API_BASE_URL}/prompts/${promptId}/revert/${versionNumber}`, 'POST', {}); // POST with empty body
};
