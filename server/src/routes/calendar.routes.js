const express = require('express');
const router = express.Router();
const CalendarController = require('../controllers/calendar.controller');

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.session.tokens) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};

router.use(requireAuth);

router.get('/events', CalendarController.listEvents);
router.post('/events', CalendarController.createEvent);
router.get('/events/:eventId', CalendarController.getEvent);
router.put('/events/:eventId', CalendarController.updateEvent);
router.delete('/events/:eventId', CalendarController.deleteEvent);

module.exports = router;