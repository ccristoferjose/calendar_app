const { setCredentials } = require('../config/google.config');

const requireAuth = (req, res, next) => {
  if (!req.session.tokens) {
    return res.status(401).json({ 
      error: 'Unauthorized. Please login first.',
      loginUrl: '/auth/google'
    });
  }

  // Set credentials for this request
  setCredentials(req.session.tokens);
  next();
};

module.exports = { requireAuth };