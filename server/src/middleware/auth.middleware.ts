import type { Response, NextFunction } from 'express';
import { auth } from '../config/firebase.config.js';
import firestoreService from '../services/firestore.service.js';
import type { AuthenticatedRequest } from '../types/index.js';

const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized. No token provided.',
        loginRequired: true
      });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(idToken);

    // Get user data from Firestore
    let userData = await firestoreService.getUser(decodedToken.uid);

    // If user doesn't exist in Firestore, create them
    if (!userData) {
      const isAdmin = decodedToken.email === process.env.ADMIN_EMAIL;
      await firestoreService.createUser(decodedToken.uid, {
        email: decodedToken.email || '',
        name: decodedToken.name || decodedToken.email || '',
        role: isAdmin ? 'admin' : 'user'
      });
      userData = await firestoreService.getUser(decodedToken.uid);
    }

    req.token = decodedToken;
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      name: userData?.name || decodedToken.name || '',
      role: userData?.role || 'user'
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
      loginRequired: true
    });
  }
};

const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await auth.verifyIdToken(idToken);

      const userData = await firestoreService.getUser(decodedToken.uid);

      req.token = decodedToken;
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        name: userData?.name || decodedToken.name || '',
        role: userData?.role || 'user'
      };
    }
  } catch (error) {
    // Silently ignore auth errors for optional auth
  }

  next();
};

export {
  requireAuth,
  optionalAuth
};
