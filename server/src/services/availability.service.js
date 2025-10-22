const { getCalendar } = require('../config/google.config');
const TimeSlotsUtil = require('../utils/timeSlots.util');
const businessConfig = require('../config/business.config');

class AvailabilityService {
  
  /**
   * Get available slots for a specific date
   */
  async getAvailableSlots(date) {
    try {
      // Generate all possible slots for the date
      const allSlots = TimeSlotsUtil.generateDaySlots(date);
      
      // Get booked appointments for this date
      const bookedSlots = await this.getBookedSlots(date);
      
      // Filter out booked, past, and out-of-window slots
      const availableSlots = allSlots.filter(slot => {
        const isBooked = bookedSlots.some(booked => 
          new Date(booked.start).getTime() === new Date(slot.start).getTime()
        );
        
        const isPast = TimeSlotsUtil.isSlotInPast(slot.start);
        const isInWindow = TimeSlotsUtil.isWithinBookingWindow(slot.start);
        
        return !isBooked && !isPast && isInWindow;
      });
      
      return {
        date: TimeSlotsUtil.formatDate(date),
        totalSlots: allSlots.length,
        bookedSlots: bookedSlots.length,
        availableSlots: availableSlots.length,
        slots: availableSlots.map(slot => ({
          start: slot.start,
          end: slot.end,
          hour: slot.hour,
          label: slot.label,
          available: true
        }))
      };
    } catch (error) {
      throw new Error(`Failed to get available slots: ${error.message}`);
    }
  }

  /**
   * Get available slots for entire week
   */
  async getWeekAvailability(startDate) {
    try {
      const weekStart = new Date(startDate);
      weekStart.setHours(0, 0, 0, 0);
      
      // Generate week slots
      const weekSlots = TimeSlotsUtil.generateWeekSlots(weekStart);
      
      // Get booked appointments for the week
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      const bookedAppointments = await this.getBookedAppointments(
        weekStart.toISOString(),
        weekEnd.toISOString()
      );
      
      // Process each day
      const availability = {};
      
      for (const [date, slots] of Object.entries(weekSlots)) {
        const dayBooked = bookedAppointments.filter(apt => {
          const aptDate = TimeSlotsUtil.formatDate(apt.start.dateTime);
          return aptDate === date;
        });
        
        const availableSlots = slots.filter(slot => {
          const isBooked = dayBooked.some(apt => 
            new Date(apt.start.dateTime).getTime() === new Date(slot.start).getTime()
          );
          
          const isPast = TimeSlotsUtil.isSlotInPast(slot.start);
          const isInWindow = TimeSlotsUtil.isWithinBookingWindow(slot.start);
          
          return !isBooked && !isPast && isInWindow;
        });
        
        availability[date] = {
          totalSlots: slots.length,
          bookedSlots: dayBooked.length,
          availableSlots: availableSlots.length,
          slots: availableSlots.map(slot => ({
            start: slot.start,
            end: slot.end,
            hour: slot.hour,
            label: slot.label,
            available: true
          }))
        };
      }
      
      return {
        startDate: TimeSlotsUtil.formatDate(weekStart),
        endDate: TimeSlotsUtil.formatDate(weekEnd),
        availability
      };
    } catch (error) {
      throw new Error(`Failed to get week availability: ${error.message}`);
    }
  }

  /**
   * Check if specific slot is available
   */
  async isSlotAvailable(startDateTime, endDateTime) {
    try {
      const calendar = getCalendar();
      
      // Query Google Calendar for events in this time range
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startDateTime,
        timeMax: endDateTime,
        singleEvents: true,
      });
      
      // If any events exist in this slot, it's not available
      return response.data.items.length === 0;
    } catch (error) {
      throw new Error(`Failed to check slot availability: ${error.message}`);
    }
  }

  /**
   * Get booked appointments for a date range
   */
  async getBookedAppointments(timeMin, timeMax) {
    try {
      const calendar = getCalendar();
      
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin,
        timeMax: timeMax,
        singleEvents: true,
        orderBy: 'startTime',
      });
      
      return response.data.items;
    } catch (error) {
      throw new Error(`Failed to get booked appointments: ${error.message}`);
    }
  }

  /**
   * Get booked slots for a specific date
   */
  async getBookedSlots(date) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const appointments = await this.getBookedAppointments(
        startOfDay.toISOString(),
        endOfDay.toISOString()
      );
      
      return appointments.map(apt => ({
        start: apt.start.dateTime || apt.start.date,
        end: apt.end.dateTime || apt.end.date,
      }));
    } catch (error) {
      throw new Error(`Failed to get booked slots: ${error.message}`);
    }
  }
}

module.exports = new AvailabilityService();