import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.post('/verify', authController.verifyToken.bind(authController));

// Protected routes
router.get('/me', requireAuth, authController.getCurrentUser.bind(authController));
router.put('/role', requireAuth, authController.updateUserRole.bind(authController));

export default router;
