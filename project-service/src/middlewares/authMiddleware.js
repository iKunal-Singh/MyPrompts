// Placeholder authentication middleware
// In a real application, this would verify a JWT and extract user information.

module.exports = (req, res, next) => {
  const userId = req.headers['x-user-id'];

  if (!userId) {
    return res.status(401).json({ msg: 'Unauthorized: Missing x-user-id header' });
  }

  // Attach userId to request object
  req.userId = userId;
  next();
};
