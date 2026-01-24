import businessConfig from '../config/business.config.js';
import type { TimeSlot, AppointmentTimes } from '../types/index.js';

class TimeSlotsUtil {
  static generateDaySlots(date: string | Date): TimeSlot[] {
    const slots: TimeSlot[] = [];
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

  static generateWeekSlots(startDate: string | Date): Record<string, TimeSlot[]> {
    const weekSlots: Record<string, TimeSlot[]> = {};
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);

      const dayOfWeek = currentDate.getDay();

      if (businessConfig.operatingDays.includes(dayOfWeek)) {
        const dateKey = this.formatDate(currentDate);
        weekSlots[dateKey] = this.generateDaySlots(currentDate);
      }
    }

    return weekSlots;
  }

  static isSlotInPast(slotStart: string): boolean {
    return new Date(slotStart) < new Date();
  }

  static isWithinBookingWindow(slotStart: string): boolean {
    const slot = new Date(slotStart);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + businessConfig.maxAdvanceBookingDays);

    return slot <= maxDate;
  }

  static formatDate(date: Date): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  static formatTimeSlot(start: Date, end: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };

    const startStr = start.toLocaleTimeString('en-US', options);
    const endStr = end.toLocaleTimeString('en-US', options);

    return `${startStr} - ${endStr}`;
  }

  static createAppointmentTimes(date: string, hour: number): AppointmentTimes {
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

export default TimeSlotsUtil;
