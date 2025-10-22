const { google } = require('googleapis');
require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Scopes define the level of access
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// Generate authentication URL
const getAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
};

// Set credentials from tokens
const setCredentials = (tokens) => {
  oauth2Client.setCredentials(tokens);
};

// Get calendar instance
const getCalendar = () => {
  return google.calendar({ version: 'v3', auth: oauth2Client });
};

module.exports = {
  oauth2Client,
  getAuthUrl,
  setCredentials,
  getCalendar,
  SCOPES
};