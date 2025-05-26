# AI Interaction Service

This service is responsible for handling interactions with external AI agents. It receives requests to execute prompts, processes them, and communicates with the configured AI models.

## Features

*   Exposes an API endpoint to execute prompts.
*   (Future) Integrates with various AI models and services.
*   (Future) Manages asynchronous tasks for long-running AI interactions.

## API Endpoints

*   `POST /api/v1/prompts/{promptId}/execute`: Executes a given prompt with specified parameters.

## Getting Started

1.  Install dependencies: `npm install`
2.  Set up environment variables: Create a `.env` file in the root of this service with the following:
    *   `MONGODB_URI`: Your MongoDB connection string.
    *   `API_ENCRYPTION_KEY`: A 32-byte key for encrypting and decrypting API keys.
    *   `PROMPT_SERVICE_URL`: The base URL for the Prompt Service (e.g., `http://prompt-service:3002`).
3.  Start the service: `npm start` (You'll need to add a start script to package.json)

## Project Structure

*   `src/`: Contains the source code for the service.
    *   `index.js`: The main entry point for the application.
    *   `routes/`: Defines the API routes.
        *   `promptRoutes.js`: Handles prompt execution requests.
    *   `(Future) controllers/`: Contains the business logic for handling requests.
    *   `(Future) services/`: Houses the logic for interacting with external AI agents and other services.
    *   `(Future) utils/`: Provides utility functions.
*   `.gitignore`: Specifies intentionally untracked files that Git should ignore.
*   `package.json`: Lists project dependencies and scripts.
*   `README.md`: This file.

## API Endpoints

*   `POST /api/v1/prompts/{promptId}/execute`: Executes a given prompt using a specified AI agent configuration.
    *   Requires `x-user-id` header.
    *   Request body should include:
        *   `agent_config_id`: ID of the AgentConfig to use.
        *   `prompt_override_params`: (Optional) Parameters to override agent settings (e.g., temperature, max_tokens).
        *   `variables`: Key-value pairs for replacing placeholders in the prompt template.
