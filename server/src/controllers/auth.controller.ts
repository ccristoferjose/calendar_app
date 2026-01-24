import type { Request, Response } from 'express';
import { auth } from '../config/firebase.config.js';
import firestoreService from '../services/firestore.service.js';
import type { AuthenticatedRequest, UserRole } from '../types/index.js';
import 'dotenv/config';

class AuthController {
  async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        res.status(400).json({
          success: false,
          error: 'ID token is required'
        });
        return;
      }

      const decodedToken = await auth.verifyIdToken(idToken);

      // Get or create user in Firestore
      let userData = await firestoreService.getUser(decodedToken.uid);

      if (!userData) {
        const isAdmin = decodedToken.email === process.env.ADMIN_EMAIL;
        await firestoreService.createUser(decodedToken.uid, {
          email: decodedToken.email || '',
          name: decodedToken.name || decodedToken.email || '',
          role: isAdmin ? 'admin' : 'user'
        });
        userData = await firestoreService.getUser(decodedToken.uid);
      }

      res.json({
        success: true,
        message: 'Token verified successfully',
        user: {
          uid: decodedToken.uid,
          email: decodedToken.email,
          name: userData?.name || decodedToken.name,
          role: userData?.role || 'user'
        }
      });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
  }

  getCurrentUser(req: AuthenticatedRequest, res: Response): void {
    if (!req.user) {
      res.status(401).json({
        success: false,
        authenticated: false
      });
      return;
    }

    res.json({
      success: true,
      authenticated: true,
      user: req.user
    });
  }

  async updateUserRole(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Admin access required'
        });
        return;
      }

      const { uid, role } = req.body;

      if (!uid || !role) {
        res.status(400).json({
          success: false,
          error: 'User ID and role are required'
        });
        return;
      }

      if (role !== 'user' && role !== 'admin') {
        res.status(400).json({
          success: false,
          error: 'Invalid role. Must be "user" or "admin"'
        });
        return;
      }

      await firestoreService.updateUserRole(uid, role as UserRole);

      res.json({
        success: true,
        message: 'User role updated successfully'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: message
      });
    }
  }
}

export default new AuthController();
