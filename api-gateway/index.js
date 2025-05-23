require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL;
const PROJECT_SERVICE_URL = process.env.PROJECT_SERVICE_URL;
const PROMPT_SERVICE_URL = process.env.PROMPT_SERVICE_URL;
const AGENT_MANAGEMENT_SERVICE_URL = process.env.AGENT_MANAGEMENT_SERVICE_URL;

// Log requests
app.use(morgan('dev'));

// Middleware to simulate adding x-user-id header
// In a real app, this would come from JWT verification
app.use((req, res, next) => {
  // For simplicity, hardcoding user ID. Replace with actual auth logic.
  req.headers['x-user-id'] = '123'; 
  // If x-project-id is needed for prompt creation via /api/v1/prompts, it should be set by client
  // or another middleware if derivable from context.
  // For /api/v1/projects/:projectId/prompts, projectId is in path.
  next();
});

// Proxy to User Service
if (USER_SERVICE_URL) {
  console.log(`Auth service URL: ${USER_SERVICE_URL}`);
  app.use(
    '/api/v1/auth',
    createProxyMiddleware({
      target: USER_SERVICE_URL,
      changeOrigin: true,
      onError: (err, req, res) => {
        console.error('Auth Service Proxy Error:', err);
        res.status(500).send('Proxy error to Auth Service');
      },
    })
  );
} else {
  console.error('USER_SERVICE_URL not defined. Auth service routes will not be proxied.');
}

// Proxy to Project Service
if (PROJECT_SERVICE_URL) {
  console.log(`Project service URL: ${PROJECT_SERVICE_URL}`);
  app.use(
    '/api/v1/projects', // This will catch /api/v1/projects and /api/v1/projects/*
    createProxyMiddleware({
      target: PROJECT_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: (path, req) => {
        // If the path is /api/v1/projects/:projectId/prompts, it should NOT be handled by project service
        // It will be handled by the next rule for prompt service.
        // This pathRewrite is tricky. The order of routes will be important.
        // For now, simple rewrite, assuming this rule doesn't overlap badly with prompt service.
        return path.replace('/api/v1/projects', '/api/v1/projects'); // Effectively no change, keeps base path
      },
      onError: (err, req, res) => {
        console.error('Project Service Proxy Error:', err);
        res.status(500).send('Proxy error to Project Service');
      },
    })
  );
} else {
  console.error('PROJECT_SERVICE_URL not defined. Project service routes will not be proxied.');
}

// Proxy to Prompt Service
// This needs to handle:
// 1. /api/v1/prompts (for creating prompts, getting specific prompt by ID)
// 2. /api/v1/projects/:projectId/prompts (for listing prompts under a project)
if (PROMPT_SERVICE_URL) {
  console.log(`Prompt service URL: ${PROMPT_SERVICE_URL}`);
  app.use(
    ['/api/v1/prompts', '/api/v1/projects/:projectId/prompts'],
    createProxyMiddleware({
      target: PROMPT_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: (path, req) => {
        // Path for Prompt Service:
        // /api/v1/prompts -> /api/v1/prompts
        // /api/v1/projects/:projectId/prompts -> /api/v1/projects/:projectId/prompts
        // No rewrite needed as the target service expects these exact paths.
        return path;
      },
      router: (req) => {
        // If we needed to dynamically choose target based on path, router could be used.
        // For now, target is fixed for these paths.
        return PROMPT_SERVICE_URL;
      },
      onProxyReq: (proxyReq, req, res) => {
        // Forward x-project-id if present in original request, for POST /api/v1/prompts
        if (req.headers['x-project-id']) {
          proxyReq.setHeader('x-project-id', req.headers['x-project-id']);
        }
        // x-user-id is already being added by the middleware above
      },
      onError: (err, req, res) => {
        console.error('Prompt Service Proxy Error:', err);
        res.status(500).send('Proxy error to Prompt Service');
      },
    })
  );
} else {
  console.error('PROMPT_SERVICE_URL not defined. Prompt service routes will not be proxied.');
}

// Proxy to Agent Management Service
if (AGENT_MANAGEMENT_SERVICE_URL) {
  console.log(`Agent Management service URL: ${AGENT_MANAGEMENT_SERVICE_URL}`);
  app.use(
    '/api/v1/agents',
    createProxyMiddleware({
      target: AGENT_MANAGEMENT_SERVICE_URL,
      changeOrigin: true,
      // pathRewrite: { '^/api/v1/agents': '/api/v1/agents' }, // Default, no rewrite needed if paths match
      onError: (err, req, res) => {
        console.error('Agent Management Service Proxy Error:', err);
        res.status(500).send('Proxy error to Agent Management Service');
      },
    })
  );
} else {
  console.error('AGENT_MANAGEMENT_SERVICE_URL not defined. Agent service routes will not be proxied.');
}


// Basic health check endpoint for the gateway itself
app.get('/health', (req, res) => {
    res.status(200).send('API Gateway is healthy');
});

app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
  if (USER_SERVICE_URL) console.log(`Proxying /api/v1/auth to ${USER_SERVICE_URL}`);
  if (PROJECT_SERVICE_URL) console.log(`Proxying /api/v1/projects to ${PROJECT_SERVICE_URL}`);
  if (PROMPT_SERVICE_URL) console.log(`Proxying /api/v1/prompts and /api/v1/projects/:projectId/prompts to ${PROMPT_SERVICE_URL}`);
  if (AGENT_MANAGEMENT_SERVICE_URL) console.log(`Proxying /api/v1/agents to ${AGENT_MANAGEMENT_SERVICE_URL}`);
});

module.exports = app; // For potential testing
