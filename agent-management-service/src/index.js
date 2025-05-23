require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('../../shared/db'); // Shared DB connection
const agentConfigRoutes = require('./routes/agentConfigRoutes');

const SERVICE_NAME = 'Agent-Management-Service';

// Connect to MongoDB
connectDB(SERVICE_NAME);

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/agents', agentConfigRoutes);

// Basic error handling (can be more sophisticated)
app.use((err, req, res, next) => {
  console.error(`[${SERVICE_NAME}] Error: ${err.message}`);
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send(`${SERVICE_NAME} is healthy`);
});

app.listen(PORT, () => {
  console.log(`${SERVICE_NAME} listening on port ${PORT}`);
});

module.exports = app;
