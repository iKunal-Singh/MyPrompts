require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const morgan = 'morgan'; // This was 'morgan' before, fixed.
const promptRoutes = require('./routes/promptRoutes');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(require('morgan')('dev')); // Correctly require and use morgan
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
// Mount promptRoutes at /api/v1 to match defined route structures
app.use('/api/v1', promptRoutes);

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('Prompt Service is healthy');
});

app.listen(PORT, () => {
  console.log(`Prompt service listening on port ${PORT}`);
});

module.exports = app; // For potential testing
