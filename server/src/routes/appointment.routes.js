const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const { optionalAuth } = require('../middleware/auth.middleware');

// Public routes - view availability
router.get('/availability/date/:date', appointmentController.getAvailableSlots);
router.get('/availability/week/:startDate?', appointmentController.getWeekAvailability);

// Protected routes - booking and management (users must be logged in via admin's calendar)
// For booking, we use optional auth since users might book without logging in
router.post('/book', appointmentController.bookAppointment);

// User's own appointments (requires auth)
// If you want users to see their bookings, they'd need to authenticate
// Otherwise, you could send a confirmation email with a booking reference
// router.get('/my', requireAuth, appointmentController.getMyAppointments);
// router.delete('/:id/cancel', requireAuth, appointmentController.cancelAppointment);

module.exports = router;