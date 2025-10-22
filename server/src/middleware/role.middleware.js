require('dotenv').config();

const requireAdmin = (req, res, next) => {
  // Check if user is authenticated
  if (!req.session.user) {
    return res.status(401).json({ 
      success: false,
      error: 'Unauthorized. Please login first.' 
    });
  }

  // Check if user has admin role
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      error: 'Forbidden. Admin access required.' 
    });
  }

  next();
};

const checkRole = (req, res, next) => {
  if (req.session.user) {
    req.user = req.session.user;
    req.isAdmin = req.user.role === 'admin';
  }
  next();
};

module.exports = { 
  requireAdmin,
  checkRole 
};