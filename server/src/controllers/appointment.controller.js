const calendarService = require('../services/calendar.service');
const availabilityService = require('../services/availability.service');

class AppointmentController {
  
  /**
   * GET /api/appointments/availability/date/:date
   * Get available slots for a specific date
   */
  async getAvailableSlots(req, res) {
    try {
      const { date } = req.params;
      
      if (!date) {
        return res.status(400).json({
          success: false,
          error: 'Date parameter is required (format: YYYY-MM-DD)'
        });
      }

      const availability = await availabilityService.getAvailableSlots(date);
      
      res.json({
        success: true,
        data: availability
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/appointments/availability/week/:startDate
   * Get available slots for entire week
   */
  async getWeekAvailability(req, res) {
    try {
      const { startDate } = req.params;
      
      const start = startDate ? new Date(startDate) : new Date();
      const availability = await availabilityService.getWeekAvailability(start);
      
      res.json({
        success: true,
        data: availability
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/appointments/book
   * Book an appointment
   */
  async bookAppointment(req, res) {
    try {
      const appointmentData = req.body;
      
      // Validate required fields
      if (!appointmentData.customerName || !appointmentData.date || !appointmentData.hour) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: customerName, date, hour'
        });
      }

      // Create start and end times based on date and hour
      const TimeSlotsUtil = require('../utils/timeSlots.util');
      const times = TimeSlotsUtil.createAppointmentTimes(
        appointmentData.date,
        appointmentData.hour
      );

      const fullAppointmentData = {
        ...appointmentData,
        startDateTime: times.startDateTime,
        endDateTime: times.endDateTime
      };

      const appointment = await calendarService.createAppointment(fullAppointmentData);
      
      res.status(201).json({
        success: true,
        message: 'Appointment booked successfully',
        data: appointment
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/appointments/my
   * Get current user's appointments
   */
  async getMyAppointments(req, res) {
    try {
      const userEmail = req.session.user?.email;
      
      if (!userEmail) {
        return res.status(401).json({
          success: false,
          error: 'User email not found in session'
        });
      }

      const appointments = await calendarService.getCustomerAppointments(userEmail);
      
      res.json({
        success: true,
        count: appointments.length,
        data: appointments
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * DELETE /api/appointments/:id/cancel
   * Cancel an appointment
   */
  async cancelAppointment(req, res) {
    try {
      const { id } = req.params;
      const result = await calendarService.cancelAppointment(id, true);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new AppointmentController();