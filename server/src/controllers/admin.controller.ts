import type { Request, Response } from 'express';
import appointmentService from '../services/appointment.service.js';
import availabilityService from '../services/availability.service.js';
import type { AppointmentData, DashboardStats } from '../types/index.js';

interface IdParams {
  id: string;
}

interface AppointmentQuery {
  startDate?: string;
  endDate?: string;
  maxResults?: string;
}

class AdminController {
  async getAllAppointments(req: Request<unknown, unknown, unknown, AppointmentQuery>, res: Response): Promise<void> {
    try {
      const { startDate, endDate, maxResults } = req.query;

      const timeMin = startDate ? new Date(startDate).toISOString() : new Date().toISOString();
      const timeMax = endDate ? new Date(endDate).toISOString() : undefined;

      const appointments = await appointmentService.getAllAppointments(
        timeMin,
        timeMax,
        parseInt(maxResults || '100')
      );

      res.json({
        success: true,
        count: appointments.length,
        data: appointments
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: message
      });
    }
  }

  async getAppointment(req: Request<IdParams>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const appointment = await appointmentService.getAppointment(id);

      res.json({
        success: true,
        data: appointment
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(404).json({
        success: false,
        error: message
      });
    }
  }

  async updateAppointment(req: Request<IdParams, unknown, AppointmentData>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const appointmentData = req.body;

      const appointment = await appointmentService.updateAppointment(id, appointmentData);

      res.json({
        success: true,
        message: 'Appointment updated successfully',
        data: appointment
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        success: false,
        error: message
      });
    }
  }

  async deleteAppointment(req: Request<IdParams>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await appointmentService.cancelAppointment(id, false);

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        success: false,
        error: message
      });
    }
  }

  async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);

      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + 7);

      const todayAppointments = await appointmentService.getAllAppointments(
        today.toISOString(),
        endOfToday.toISOString()
      );

      const weekAppointments = await appointmentService.getAllAppointments(
        today.toISOString(),
        endOfWeek.toISOString()
      );

      const weekAvailability = await availabilityService.getWeekAvailability(today);

      const totalWeekSlots = Object.values(weekAvailability.availability)
        .reduce((sum, day) => sum + day.totalSlots, 0);

      const bookedWeekSlots = Object.values(weekAvailability.availability)
        .reduce((sum, day) => sum + day.bookedSlots, 0);

      const availableWeekSlots = Object.values(weekAvailability.availability)
        .reduce((sum, day) => sum + day.availableSlots, 0);

      const stats: DashboardStats = {
        today: {
          appointments: todayAppointments.length,
          date: today.toISOString().split('T')[0]
        },
        thisWeek: {
          appointments: weekAppointments.length,
          totalSlots: totalWeekSlots,
          bookedSlots: bookedWeekSlots,
          availableSlots: availableWeekSlots,
          occupancyRate: totalWeekSlots > 0
            ? ((bookedWeekSlots / totalWeekSlots) * 100).toFixed(2) + '%'
            : '0%'
        },
        upcomingAppointments: weekAppointments.slice(0, 5)
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: message
      });
    }
  }
}

export default new AdminController();
