const { setCredentials } = require('../config/google.config');

const requireAuth = (req, res, next) => {
  if (!req.session.tokens) {
    return res.status(401).json({ 
      success: false,
      error: 'Unauthorized. Please login first.',
      loginRequired: true
    });
  }

  // Set credentials for this request
  setCredentials(req.session.tokens);
  next();
};

// Optional auth - doesn't block if not authenticated
const optionalAuth = (req, res, next) => {
  if (req.session.tokens) {
    setCredentials(req.session.tokens);
  }
  next();
};

module.exports = { 
  requireAuth,
  optionalAuth 
};