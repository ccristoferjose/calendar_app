import { Router } from 'express';
import adminController from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(requireAuth);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats.bind(adminController));

// Appointments management
router.get('/appointments', adminController.getAllAppointments.bind(adminController));
router.get('/appointments/:id', adminController.getAppointment.bind(adminController));
router.put('/appointments/:id', adminController.updateAppointment.bind(adminController));
router.delete('/appointments/:id', adminController.deleteAppointment.bind(adminController));

export default router;
