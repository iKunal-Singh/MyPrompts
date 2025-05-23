const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController'); // We'll create this later

const router = express.Router();

// POST /api/v1/auth/register
router.post(
  '/register',
  [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  authController.register
);

// POST /api/v1/auth/login
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  authController.login
);

module.exports = router;
