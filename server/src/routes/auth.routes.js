const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');

router.get('/google', AuthController.login);
router.get('/google/callback', AuthController.callback);
router.get('/logout', AuthController.logout);

module.exports = router;