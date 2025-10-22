const { oauth2Client, getAuthUrl, setCredentials } = require('../config/google.config');
const User = require('../models/user.model');
require('dotenv').config();

class AuthController {
  
  /**
   * Get authentication URL
   */
  getAuthUrl(req, res) {
    try {
      const authUrl = getAuthUrl();
      res.json({
        success: true,
        authUrl: authUrl,
        message: 'Use this URL to authenticate with Google'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(req, res) {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ 
        success: false,
        error: 'Authorization code is missing' 
      });
    }

    try {
      // Exchange code for tokens
      const { tokens } = await oauth2Client.getToken(code);
      
      // Set credentials
      setCredentials(tokens);
      oauth2Client.setCredentials(tokens);
      
      // Get user info from Google
      const { google } = require('googleapis');
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();
      
      // Determine role (check if admin email)
      const role = userInfo.data.email === process.env.ADMIN_EMAIL ? 'admin' : 'user';
      
      // Create user object
      const user = new User({
        email: userInfo.data.email,
        name: userInfo.data.name,
        role: role,
        tokens: tokens
      });
      
      // Store in session
      req.session.tokens = tokens;
      req.session.user = user.toJSON();
      
      // Return success (for mobile app, you might want to use deep linking)
      res.json({
        success: true,
        message: 'Authentication successful',
        user: user.toJSON(),
        tokens: tokens // Send tokens to mobile app to store securely
      });
    } catch (error) {
      console.error('Error during authentication:', error);
      res.status(500).json({ 
        success: false,
        error: 'Authentication failed' 
      });
    }
  }

  /**
   * Logout
   */
  logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ 
          success: false,
          error: 'Logout failed' 
        });
      }
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    });
  }

  /**
   * Get current user info
   */
  getCurrentUser(req, res) {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        authenticated: false
      });
    }

    res.json({
      success: true,
      authenticated: true,
      user: req.session.user
    });
  }

  /**
   * Refresh token endpoint for mobile app
   */
  async refreshToken(req, res) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    try {
      oauth2Client.setCredentials({ refresh_token: refreshToken });
      const { credentials } = await oauth2Client.refreshAccessToken();
      
      req.session.tokens = credentials;
      
      res.json({
        success: true,
        tokens: credentials
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'Failed to refresh token'
      });
    }
  }
}

module.exports = new AuthController();