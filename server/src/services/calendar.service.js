const { getCalendar } = require('../config/google.config');
const Appointment = require('../models/appointment.model');
const availabilityService = require('./availability.service');

class CalendarService {
  
  /**
   * Create appointment (with availability check)
   */
  async createAppointment(appointmentData) {
    try {
      const appointment = new Appointment(appointmentData);
      const validation = appointment.validate();
      
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Check if slot is available
      const isAvailable = await availabilityService.isSlotAvailable(
        appointment.start.dateTime,
        appointment.end.dateTime
      );

      if (!isAvailable) {
        throw new Error('This time slot is no longer available');
      }

      const calendar = getCalendar();
      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: appointment.toJSON(),
        sendUpdates: 'all', // Send email notifications to attendees
      });
      
      return {
        ...Appointment.fromCalendarEvent(response.data),
        message: 'Appointment booked successfully'
      };
    } catch (error) {
      throw new Error(`Failed to create appointment: ${error.message}`);
    }
  }

  /**
   * Get all appointments (admin only)
   */
  async getAllAppointments(timeMin, timeMax, maxResults = 100) {
    try {
      const calendar = getCalendar();
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax,
        maxResults: maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });
      
      return response.data.items.map(event => 
        Appointment.fromCalendarEvent(event)
      );
    } catch (error) {
      throw new Error(`Failed to list appointments: ${error.message}`);
    }
  }

  /**
   * Get appointment by ID
   */
  async getAppointment(eventId) {
    try {
      const calendar = getCalendar();
      const response = await calendar.events.get({
        calendarId: 'primary',
        eventId: eventId,
      });
      
      return Appointment.fromCalendarEvent(response.data);
    } catch (error) {
      throw new Error(`Failed to get appointment: ${error.message}`);
    }
  }

  /**
   * Update appointment
   */
  async updateAppointment(eventId, appointmentData) {
    try {
      const appointment = new Appointment(appointmentData);
      const validation = appointment.validate();
      
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const calendar = getCalendar();
      const response = await calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: appointment.toJSON(),
        sendUpdates: 'all',
      });
      
      return Appointment.fromCalendarEvent(response.data);
    } catch (error) {
      throw new Error(`Failed to update appointment: ${error.message}`);
    }
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(eventId, sendNotification = true) {
    try {
      const calendar = getCalendar();
      
      if (sendNotification) {
        // Update event status to cancelled instead of deleting
        const response = await calendar.events.patch({
          calendarId: 'primary',
          eventId: eventId,
          resource: {
            status: 'cancelled',
            summary: '[CANCELLED] ' + (await this.getAppointment(eventId)).customerName
          },
          sendUpdates: 'all',
        });
        
        return {
          message: 'Appointment cancelled successfully',
          data: Appointment.fromCalendarEvent(response.data)
        };
      } else {
        await calendar.events.delete({
          calendarId: 'primary',
          eventId: eventId,
          sendUpdates: 'none',
        });
        
        return { message: 'Appointment deleted successfully' };
      }
    } catch (error) {
      throw new Error(`Failed to cancel appointment: ${error.message}`);
    }
  }

  /**
   * Get appointments by customer email
   */
  async getCustomerAppointments(customerEmail) {
    try {
      const calendar = getCalendar();
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 50,
        singleEvents: true,
        orderBy: 'startTime',
        q: customerEmail, // Search by email
      });
      
      return response.data.items
        .map(event => Appointment.fromCalendarEvent(event))
        .filter(apt => apt.customerEmail === customerEmail);
    } catch (error) {
      throw new Error(`Failed to get customer appointments: ${error.message}`);
    }
  }
}

module.exports = new CalendarService();