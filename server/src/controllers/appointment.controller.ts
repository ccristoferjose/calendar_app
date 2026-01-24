import type { Request, Response } from 'express';
import appointmentService from '../services/appointment.service.js';
import availabilityService from '../services/availability.service.js';
import TimeSlotsUtil from '../utils/timeSlots.util.js';
import type { AuthenticatedRequest, AppointmentData } from '../types/index.js';

interface DateParams {
  date: string;
}

interface StartDateParams {
  startDate?: string;
}

interface IdParams {
  id: string;
}

class AppointmentController {
  async getAvailableSlots(req: Request<DateParams>, res: Response): Promise<void> {
    try {
      const { date } = req.params;

      if (!date) {
        res.status(400).json({
          success: false,
          error: 'Date parameter is required (format: YYYY-MM-DD)'
        });
        return;
      }

      const availability = await availabilityService.getAvailableSlots(date);

      res.json({
        success: true,
        data: availability
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: message
      });
    }
  }

  async getWeekAvailability(req: Request<StartDateParams>, res: Response): Promise<void> {
    try {
      const { startDate } = req.params;

      const start = startDate ? new Date(startDate) : new Date();
      const availability = await availabilityService.getWeekAvailability(start);

      res.json({
        success: true,
        data: availability
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: message
      });
    }
  }

  async bookAppointment(req: Request, res: Response): Promise<void> {
    try {
      const appointmentData = req.body as Partial<AppointmentData>;

      if (!appointmentData.customerName || !appointmentData.date || !appointmentData.hour) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: customerName, date, hour'
        });
        return;
      }

      const times = TimeSlotsUtil.createAppointmentTimes(
        appointmentData.date,
        appointmentData.hour
      );

      const fullAppointmentData: AppointmentData = {
        ...appointmentData,
        customerName: appointmentData.customerName,
        startDateTime: times.startDateTime,
        endDateTime: times.endDateTime
      };

      const appointment = await appointmentService.createAppointment(fullAppointmentData);

      res.status(201).json({
        success: true,
        message: 'Appointment booked successfully',
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

  async getMyAppointments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userEmail = req.user?.email;

      if (!userEmail) {
        res.status(401).json({
          success: false,
          error: 'User email not found'
        });
        return;
      }

      const appointments = await appointmentService.getCustomerAppointments(userEmail);

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

  async cancelAppointment(req: Request<IdParams>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await appointmentService.cancelAppointment(id, true);

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
}

export default new AppointmentController();
