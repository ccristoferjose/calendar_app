const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.get('/google', authController.login);
router.get('/google/callback', authController.callback);
router.get('/logout', authController.logout);
router.get('/status', authController.status);

module.exports = router;