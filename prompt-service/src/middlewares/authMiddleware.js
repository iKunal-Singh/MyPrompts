// Placeholder authentication middleware for Prompt Service

module.exports = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  // projectId might come from path params for specific routes, or header for general creation
  const projectIdFromHeader = req.headers['x-project-id']; 
  
  if (!userId) {
    return res.status(401).json({ msg: 'Unauthorized: Missing x-user-id header' });
  }

  req.userId = userId;

  // If projectId is in the path, it will be handled by the controller/router.
  // If it's needed from header (e.g., for creating a prompt directly without /projects/:projectId/prompts),
  // it's available as projectIdFromHeader.
  if (projectIdFromHeader) {
    req.projectIdFromHeader = projectIdFromHeader;
  }
  
  next();
};
