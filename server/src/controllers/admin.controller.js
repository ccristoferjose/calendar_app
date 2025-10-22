const calendarService = require('../services/calendar.service');
const availabilityService = require('../services/availability.service');

class AdminController {
  
  /**
   * GET /api/admin/appointments
   * Get all appointments with filters
   */
  async getAllAppointments(req, res) {
    try {
      const { startDate, endDate, maxResults } = req.query;
      
      const timeMin = startDate ? new Date(startDate).toISOString() : new Date().toISOString();
      const timeMax = endDate ? new Date(endDate).toISOString() : undefined;
      
      const appointments = await calendarService.getAllAppointments(
        timeMin,
        timeMax,
        parseInt(maxResults) || 100
      );
      
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
   * GET /api/admin/appointments/:id
   * Get specific appointment details
   */
  async getAppointment(req, res) {
    try {
      const { id } = req.params;
      const appointment = await calendarService.getAppointment(id);
      
      res.json({
        success: true,
        data: appointment
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * PUT /api/admin/appointments/:id
   * Update appointment
   */
  async updateAppointment(req, res) {
    try {
      const { id } = req.params;
      const appointmentData = req.body;
      
      const appointment = await calendarService.updateAppointment(id, appointmentData);
      
      res.json({
        success: true,
        message: 'Appointment updated successfully',
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
   * DELETE /api/admin/appointments/:id
   * Delete appointment permanently
   */
  async deleteAppointment(req, res) {
    try {
      const { id } = req.params;
      const result = await calendarService.cancelAppointment(id, false);
      
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

  /**
   * GET /api/admin/dashboard/stats
   * Get dashboard statistics
   */
  async getDashboardStats(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);
      
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + 7);
      
      // Get today's appointments
      const todayAppointments = await calendarService.getAllAppointments(
        today.toISOString(),
        endOfToday.toISOString()
      );
      
      // Get week's appointments
      const weekAppointments = await calendarService.getAllAppointments(
        today.toISOString(),
        endOfWeek.toISOString()
      );
      
      // Get week availability
      const weekAvailability = await availabilityService.getWeekAvailability(today);
      
      // Calculate stats
      const totalWeekSlots = Object.values(weekAvailability.availability)
        .reduce((sum, day) => sum + day.totalSlots, 0);
      
      const bookedWeekSlots = Object.values(weekAvailability.availability)
        .reduce((sum, day) => sum + day.bookedSlots, 0);
      
      const availableWeekSlots = Object.values(weekAvailability.availability)
        .reduce((sum, day) => sum + day.availableSlots, 0);
      
      res.json({
        success: true,
        data: {
          today: {
            appointments: todayAppointments.length,
            date: today.toISOString().split('T')[0]
          },
          thisWeek: {
            appointments: weekAppointments.length,
            totalSlots: totalWeekSlots,
            bookedSlots: bookedWeekSlots,
            availableSlots: availableWeekSlots,
            occupancyRate: ((bookedWeekSlots / totalWeekSlots) * 100).toFixed(2) + '%'
          },
          upcomingAppointments: weekAppointments.slice(0, 5) // Next 5 appointments
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new AdminController();