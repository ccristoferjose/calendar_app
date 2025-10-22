const { oauth2Client, SCOPES } = require('../config/google.config');

class AuthController {
  static login(req, res) {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    });
    res.redirect(authUrl);
  }

  static async callback(req, res) {
    const { code } = req.query;
    
    try {
      const { tokens } = await oauth2Client.getToken(code);
      req.session.tokens = tokens;
      res.redirect('/dashboard');
    } catch (error) {
      console.error('Error retrieving access token', error);
      res.status(500).send('Authentication failed');
    }
  }

  static logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send('Could not log out');
      }
      res.redirect('/');
    });
  }
}

module.exports = AuthController;