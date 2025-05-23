// Placeholder authentication middleware for Agent Management Service

module.exports = (req, res, next) => {
  const userId = req.headers['x-user-id'];

  if (!userId) {
    // Depending on the route, this might be optional or strictly required.
    // For agent configs, it's strictly required.
    return res.status(401).json({ msg: 'Unauthorized: Missing x-user-id header' });
  }

  req.userId = userId;
  next();
};
