require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const connectDB = require('../../shared/db'); // Import connectDB

// Connect to MongoDB
connectDB('User-Service');

const app = express();
const PORT = process.env.PORT || 3001; // Corrected port for user-service

// Middleware
app.use(morgan('dev')); // Logger
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/auth', authRoutes);

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`User service listening on port ${PORT}`);
});

module.exports = app; // For potential testing
