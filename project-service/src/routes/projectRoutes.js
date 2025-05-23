const express = require('express');
const { check } = require('express-validator');
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// All project routes are protected by the authMiddleware
router.use(authMiddleware);

// POST /api/v1/projects
router.post(
  '/',
  [
    check('name', 'Project name is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('project_type_tag', 'Project type tag is required').not().isEmpty(),
  ],
  projectController.createProject
);

// GET /api/v1/projects
router.get('/', projectController.getProjects);

module.exports = router;
