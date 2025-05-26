const express = require('express');
const router = express.Router();
const axios = require('axios');
const AgentConfig = require('../models/AgentConfig');
const { decrypt } = require('../utils/encryption');

// Configuration for AI Providers
const AI_PROVIDER_CONFIGS = {
  OPENAI: {
    CHAT_COMPLETIONS_URL: 'https://api.openai.com/v1/chat/completions',
    IMAGES_GENERATIONS_URL: 'https://api.openai.com/v1/images/generations',
    DEFAULT_CHAT_MODEL: 'gpt-4',
    DEFAULT_IMAGE_MODEL: 'dall-e-3',
  },
  ANTHROPIC: {
    MESSAGES_URL: 'https://api.anthropic.com/v1/messages',
    DEFAULT_MODEL: 'claude-2',
    API_VERSION: '2023-06-01',
  },
  GOOGLE: {
    GEMINI_PRO_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    DEFAULT_MODEL: 'gemini-pro',
  }
};

// Helper function for OpenAI API calls
async function handleOpenAICall(apiKey, promptContent, params, settings, agentType) {
  const isImageAgent = agentType && (agentType.toLowerCase().includes('dall-e') || agentType.toLowerCase().includes('image'));
  const url = isImageAgent ? AI_PROVIDER_CONFIGS.OPENAI.IMAGES_GENERATIONS_URL : AI_PROVIDER_CONFIGS.OPENAI.CHAT_COMPLETIONS_URL;
  
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };

  let requestBody;
  if (isImageAgent) {
    // DALL-E
    requestBody = {
      prompt: promptContent,
      model: (settings && settings.model) || AI_PROVIDER_CONFIGS.OPENAI.DEFAULT_IMAGE_MODEL,
      n: (params && params.n) || (settings && settings.n) || 1,
      size: (params && params.size) || (settings && settings.size) || '1024x1024',
      quality: (params && params.quality) || (settings && settings.quality) || 'standard',
      style: (params && params.style) || (settings && settings.style) || 'vivid',
      ...params, // Allow override of all parameters
    };
  } else {
    // GPT Chat
    requestBody = {
      model: (settings && settings.model) || AI_PROVIDER_CONFIGS.OPENAI.DEFAULT_CHAT_MODEL,
      messages: [{ role: 'user', content: promptContent }],
      temperature: (params && params.temperature) || (settings && settings.temperature) || 0.7,
      max_tokens: (params && params.max_tokens) || (settings && settings.max_tokens) || 256,
      ...params, // Allow override of all parameters
    };
  }
  
  // Remove any non-API settings that might have come from agentConfig.settings or params
  delete requestBody.provider;
  delete requestBody.agentName; // Assuming this might be in settings

  try {
    const aiResponse = await axios.post(url, requestBody, { headers });
    if (isImageAgent) {
      // DALL-E: Return image URL(s)
      return aiResponse.data.data.map(img => img.url);
    } else {
      // GPT Chat: Return message content
      const messageContent = aiResponse.data.choices && aiResponse.data.choices[0] && aiResponse.data.choices[0].message && aiResponse.data.choices[0].message.content;
      if (messageContent) {
        return messageContent;
      } else {
        console.error('Unexpected response structure from OpenAI:', aiResponse.data);
        throw new Error('Unexpected response structure from AI provider');
      }
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error.message);
    if (error.response) {
      throw { status: error.response.status, data: error.response.data, message: 'Error from AI provider' };
    }
    throw { status: 502, message: 'Error calling external AI agent' };
  }
}


// Placeholder for other handlers (to be implemented)
async function handleClaudeCall(apiKey, promptContent, params, settings) {
  const url = AI_PROVIDER_CONFIGS.ANTHROPIC.MESSAGES_URL;
  const headers = {
    'x-api-key': apiKey,
    'anthropic-version': AI_PROVIDER_CONFIGS.ANTHROPIC.API_VERSION,
    'Content-Type': 'application/json'
  };

  const requestBody = {
    model: (settings && settings.model) || AI_PROVIDER_CONFIGS.ANTHROPIC.DEFAULT_MODEL,
    max_tokens: (params && params.max_tokens) || (settings && settings.max_tokens_to_sample) || 1024, // Claude uses max_tokens_to_sample
    messages: [{ role: 'user', content: promptContent }],
    temperature: (params && params.temperature) || (settings && settings.temperature) || 0.7,
    top_k: (params && params.top_k) || (settings && settings.top_k),
    top_p: (params && params.top_p) || (settings && settings.top_p),
    // stream: false, // Default to false, can be overridden by params
    ...params, // Allow override of all parameters, be mindful of Claude specific ones
  };

  // Remove any non-Claude settings
  delete requestBody.provider;
  delete requestBody.agentName;
  if (params && params.max_tokens && !params.max_tokens_to_sample) { // if original was max_tokens, ensure max_tokens_to_sample is used
    requestBody.max_tokens_to_sample = params.max_tokens;
    delete requestBody.max_tokens;
  }
   if (settings && settings.max_tokens && !settings.max_tokens_to_sample) {
    requestBody.max_tokens_to_sample = settings.max_tokens;
    delete requestBody.max_tokens;
  }


  try {
    const aiResponse = await axios.post(url, requestBody, { headers });
    const messageContent = aiResponse.data.content && aiResponse.data.content[0] && aiResponse.data.content[0].text;
    if (messageContent) {
      return messageContent;
    } else {
      console.error('Unexpected response structure from Anthropic Claude:', aiResponse.data);
      throw new Error('Unexpected response structure from AI provider (Claude)');
    }
  } catch (error) {
    console.error('Error calling Anthropic Claude API:', error.message);
    if (error.response) {
      throw { status: error.response.status, data: error.response.data, message: 'Error from AI provider (Claude)' };
    }
    throw { status: 502, message: 'Error calling external AI agent (Claude)' };
  }
}

async function handleGeminiCall(apiKey, promptContent, params, settings) {
  // Note: Gemini API URLs can vary based on model and task (generateContent, streamGenerateContent, etc.)
  // This example uses generateContent for gemini-pro.
  const model = (settings && settings.model) || AI_PROVIDER_CONFIGS.GOOGLE.DEFAULT_MODEL;
  // Constructing the URL with the model, assuming it's part of the path and not a query param for this endpoint
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const headers = {
    'Content-Type': 'application/json'
  };

  const requestBody = {
    contents: [{
      parts: [{
        text: promptContent
      }]
    }],
    generationConfig: {
      temperature: (params && params.temperature) || (settings && settings.temperature) || 0.7,
      topK: (params && params.topK) || (settings && settings.topK),
      topP: (params && params.topP) || (settings && settings.topP),
      maxOutputTokens: (params && params.maxOutputTokens) || (settings && settings.maxOutputTokens) || 2048,
      // candidateCount: (params && params.candidateCount) || (settings && settings.candidateCount), // Example: if you want more than one candidate
      ...params.generationConfig, // Allow full override of generationConfig from params
    },
    // safetySettings: [], // Optional: configure safety settings if needed
  };
  
  // Clean up any non-Gemini settings from the top level of params if they were passed
  // (assuming they are meant for generationConfig which is handled above)
  delete requestBody.provider;
  delete requestBody.agentName;


  try {
    const aiResponse = await axios.post(url, requestBody, { headers });
    // Accessing the text from the first candidate's first part.
    const messageContent = aiResponse.data.candidates &&
                           aiResponse.data.candidates[0] &&
                           aiResponse.data.candidates[0].content &&
                           aiResponse.data.candidates[0].content.parts &&
                           aiResponse.data.candidates[0].content.parts[0] &&
                           aiResponse.data.candidates[0].content.parts[0].text;

    if (messageContent) {
      return messageContent;
    } else {
      console.error('Unexpected response structure from Google Gemini:', aiResponse.data);
      // Check for promptFeedback if content is missing
      if (aiResponse.data.promptFeedback && aiResponse.data.promptFeedback.blockReason) {
        throw new Error(`Request blocked by Gemini due to: ${aiResponse.data.promptFeedback.blockReason}. Details: ${JSON.stringify(aiResponse.data.promptFeedback.safetyRatings)}`);
      }
      throw new Error('Unexpected response structure from AI provider (Gemini)');
    }
  } catch (error) {
    console.error('Error calling Google Gemini API:', error.message);
    if (error.response) { // Axios error with a response from the server
      throw { status: error.response.status, data: error.response.data, message: 'Error from AI provider (Gemini)' };
    } else if (error.request) { // Axios error where the request was made but no response received
        throw { status: 503, message: 'No response received from AI provider (Gemini)'};
    }
    // For other errors (e.g., the custom error thrown above for blocked prompt)
    throw { status: 500, message: error.message || 'Error calling external AI agent (Gemini)' };
  }
}


router.post('/:promptId/execute', async (req, res) => {
  const { promptId } = req.params;
  const { agent_config_id, prompt_override_params, variables } = req.body;
  const userId = req.headers['x-user-id'];

  if (!userId) {
    return res.status(400).json({ message: 'Missing x-user-id header' });
  }
  if (!agent_config_id) {
    return res.status(400).json({ message: 'Missing agent_config_id in request body' });
  }

  try {
    const agentConfig = await AgentConfig.findOne({ _id: agent_config_id, userId });
    if (!agentConfig) {
      return res.status(404).json({ message: 'Agent configuration not found or access denied' });
    }

    let decryptedApiKey;
    try {
      decryptedApiKey = decrypt(agentConfig.api_key_encrypted);
    } catch (error) {
      console.error('API key decryption failed for agent_config_id:', agent_config_id, error);
      return res.status(500).json({ message: 'API key decryption failed. Please verify the encryption key and stored API key.' });
    }

    const promptServiceUrl = process.env.PROMPT_SERVICE_URL || 'http://prompt-service:3002';
    let promptContent;
    try {
      const promptResponse = await axios.get(`${promptServiceUrl}/api/v1/prompts/${promptId}`, {
        headers: { 'x-user-id': userId }
      });
      promptContent = promptResponse.data.prompt.content;

      if (variables && typeof variables === 'object') {
        for (const key in variables) {
          const placeholder = new RegExp(`{{${key}}}`, 'g');
          promptContent = promptContent.replace(placeholder, variables[key]);
        }
      }
    } catch (error) {
      console.error('Error fetching prompt content:', error.message);
      return res.status(error.response?.status || 500).json({ 
        message: 'Error fetching prompt from Prompt Service', 
        details: error.response?.data 
      });
    }

    let result;
    const params = prompt_override_params || {};
    const settings = agentConfig.settings || {};

    // Agent-Specific Dispatch Logic
    switch (agentConfig.agent_type) {
      case 'OpenAI-GPT-4':
      case 'OpenAI-GPT-3.5-Turbo': // Example of handling another OpenAI model
        result = await handleOpenAICall(decryptedApiKey, promptContent, params, settings, agentConfig.agent_type);
        break;
      case 'DALL-E-3':
      case 'DALL-E-2': // Example for DALL-E
         result = await handleOpenAICall(decryptedApiKey, promptContent, params, settings, agentConfig.agent_type); // Uses the same OpenAI handler
        break;
      // Add cases for other agent types like Anthropic-Claude, Gemini-Pro
      case 'Anthropic-Claude-2':
      case 'Anthropic-Claude-Instant':
        result = await handleClaudeCall(decryptedApiKey, promptContent, params, settings);
        break;
      case 'Gemini-Pro':
        result = await handleGeminiCall(decryptedApiKey, promptContent, params, settings);
        break;
      default:
        return res.status(400).json({ message: `Unsupported agent type: ${agentConfig.agent_type}` });
    }

    return res.status(200).json({ response: result });

  } catch (error) {
    console.error(`Error processing prompt ${promptId} for agent_config_id ${agent_config_id}:`, error);
    if (error.status && error.data) {
      return res.status(error.status).json({ message: error.message, provider_error: error.data });
    }
    if (error.status) {
        return res.status(error.status).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || 'Error processing request' });
  }
});

module.exports = router;
