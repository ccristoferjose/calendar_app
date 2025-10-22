const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./src/routes/auth.routes');
const calendarRoutes = require('./src/routes/calendar.routes');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('src/views'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Routes
app.use('/auth', authRoutes);
app.use('/api/calendar', calendarRoutes);

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/views/index.html'));
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  if (!req.session.tokens) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'src/views/dashboard.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});