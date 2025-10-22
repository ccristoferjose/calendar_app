const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendar.controller');
const { requireAuth } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(requireAuth);

router.get('/events', calendarController.listEvents);
router.get('/events/:id', calendarController.getEvent);
router.post('/events', calendarController.createEvent);
router.put('/events/:id', calendarController.updateEvent);
router.delete('/events/:id', calendarController.deleteEvent);

module.exports = router;