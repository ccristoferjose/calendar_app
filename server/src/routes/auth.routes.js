const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');

// Public routes
router.get('/google', authController.getAuthUrl);
router.get('/google/callback', authController.handleCallback);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.getCurrentUser);

module.exports = router;