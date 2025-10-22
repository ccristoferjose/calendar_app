const businessConfig = require('../config/business.config');

class TimeSlotsUtil {
  
  /**
   * Generate all possible time slots for a given date
   */
  static generateDaySlots(date) {
    const slots = [];
    const baseDate = new Date(date);
    baseDate.setHours(0, 0, 0, 0);
    
    for (let hour = businessConfig.openHour; hour < businessConfig.closeHour; hour++) {
      const slotStart = new Date(baseDate);
      slotStart.setHours(hour, 0, 0, 0);
      
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + businessConfig.appointmentDuration);
      
      slots.push({
        start: slotStart.toISOString(),
        end: slotEnd.toISOString(),
        hour: hour,
        label: this.formatTimeSlot(slotStart, slotEnd)
      });
    }
    
    return slots;
  }

  /**
   * Generate slots for entire week
   */
  static generateWeekSlots(startDate) {
    const weekSlots = {};
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      
      const dayOfWeek = currentDate.getDay();
      
      // Only include operating days
      if (businessConfig.operatingDays.includes(dayOfWeek)) {
        const dateKey = this.formatDate(currentDate);
        weekSlots[dateKey] = this.generateDaySlots(currentDate);
      }
    }
    
    return weekSlots;
  }

  /**
   * Check if a slot is in the past
   */
  static isSlotInPast(slotStart) {
    return new Date(slotStart) < new Date();
  }

  /**
   * Check if a slot is within booking window
   */
  static isWithinBookingWindow(slotStart) {
    const slot = new Date(slotStart);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + businessConfig.maxAdvanceBookingDays);
    
    return slot <= maxDate;
  }

  /**
   * Format date as YYYY-MM-DD
   */
  static formatDate(date) {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  /**
   * Format time slot label
   */
  static formatTimeSlot(start, end) {
    const options = { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    };
    
    const startStr = start.toLocaleTimeString('en-US', options);
    const endStr = end.toLocaleTimeString('en-US', options);
    
    return `${startStr} - ${endStr}`;
  }

  /**
   * Parse date string and create start/end times
   */
  static createAppointmentTimes(date, hour) {
    const startDateTime = new Date(date);
    startDateTime.setHours(hour, 0, 0, 0);
    
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + businessConfig.appointmentDuration);
    
    return {
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString()
    };
  }
}

module.exports = TimeSlotsUtil;