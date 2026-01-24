import { Router } from 'express';
import appointmentController from '../controllers/appointment.controller.js';

const router = Router();

// Public routes - view availability
router.get('/availability/date/:date', appointmentController.getAvailableSlots.bind(appointmentController));
router.get('/availability/week/:startDate', appointmentController.getWeekAvailability.bind(appointmentController));
router.get('/availability/week', appointmentController.getWeekAvailability.bind(appointmentController));

// Protected routes - booking and management
router.post('/book', appointmentController.bookAppointment.bind(appointmentController));

export default router;
