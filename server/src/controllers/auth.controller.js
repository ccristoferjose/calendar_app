const { oauth2Client, getAuthUrl, setCredentials } = require('../config/google.config');

class AuthController {
  
  // Redirect to Google OAuth
  login(req, res) {
    const authUrl = getAuthUrl();
    res.redirect(authUrl);
  }

  // Handle OAuth callback
  async callback(req, res) {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is missing' });
    }

    try {
      // Exchange code for tokens
      const { tokens } = await oauth2Client.getToken(code);
      
      // Set credentials
      setCredentials(tokens);
      
      // Store tokens in session
      req.session.tokens = tokens;
      
      res.redirect('/dashboard');
    } catch (error) {
      console.error('Error during authentication:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  }

  // Logout
  logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.redirect('/');
    });
  }

  // Check authentication status
  status(req, res) {
    const isAuthenticated = req.session.tokens ? true : false;
    res.json({ authenticated: isAuthenticated });
  }
}

module.exports = new AuthController();