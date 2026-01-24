import type { Response, NextFunction } from 'express';
import type { AdminRequest } from '../types/index.js';

const requireAdmin = (req: AdminRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized. Please login first.'
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'Forbidden. Admin access required.'
    });
    return;
  }

  req.isAdmin = true;
  next();
};

const checkRole = (req: AdminRequest, res: Response, next: NextFunction): void => {
  if (req.user) {
    req.isAdmin = req.user.role === 'admin';
  }
  next();
};

export {
  requireAdmin,
  checkRole
};
