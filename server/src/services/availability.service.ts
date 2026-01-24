import firestoreService from './firestore.service.js';
import TimeSlotsUtil from '../utils/timeSlots.util.js';
import type {
  DayAvailability,
  WeekAvailability,
  BookedSlot,
  AvailableSlot
} from '../types/index.js';

class AvailabilityService {
  async getAvailableSlots(date: string | Date): Promise<DayAvailability> {
    try {
      const allSlots = TimeSlotsUtil.generateDaySlots(date);
      const bookedSlots = await this.getBookedSlots(date);

      const availableSlots = allSlots.filter(slot => {
        const isBooked = bookedSlots.some(booked =>
          new Date(booked.start).getTime() === new Date(slot.start).getTime()
        );

        const isPast = TimeSlotsUtil.isSlotInPast(slot.start);
        const isInWindow = TimeSlotsUtil.isWithinBookingWindow(slot.start);

        return !isBooked && !isPast && isInWindow;
      });

      return {
        date: TimeSlotsUtil.formatDate(new Date(date)),
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
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get available slots: ${message}`);
    }
  }

  async getWeekAvailability(startDate: string | Date): Promise<WeekAvailability> {
    try {
      const weekStart = new Date(startDate);
      weekStart.setHours(0, 0, 0, 0);

      const weekSlots = TimeSlotsUtil.generateWeekSlots(weekStart);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const bookedAppointments = await firestoreService.getAppointmentsInRange(
        weekStart.toISOString(),
        weekEnd.toISOString()
      );

      const availability: Record<string, DayAvailability> = {};

      for (const [date, slots] of Object.entries(weekSlots)) {
        const dayBooked = bookedAppointments.filter(apt => {
          const aptDate = TimeSlotsUtil.formatDate(new Date(apt.startDateTime));
          return aptDate === date;
        });

        const availableSlots: AvailableSlot[] = slots.filter(slot => {
          const isBooked = dayBooked.some(apt =>
            new Date(apt.startDateTime).getTime() === new Date(slot.start).getTime()
          );

          const isPast = TimeSlotsUtil.isSlotInPast(slot.start);
          const isInWindow = TimeSlotsUtil.isWithinBookingWindow(slot.start);

          return !isBooked && !isPast && isInWindow;
        }).map(slot => ({
          ...slot,
          available: true
        }));

        availability[date] = {
          date,
          totalSlots: slots.length,
          bookedSlots: dayBooked.length,
          availableSlots: availableSlots.length,
          slots: availableSlots
        };
      }

      return {
        startDate: TimeSlotsUtil.formatDate(weekStart),
        endDate: TimeSlotsUtil.formatDate(weekEnd),
        availability
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get week availability: ${message}`);
    }
  }

  async isSlotAvailable(startDateTime: string, endDateTime: string): Promise<boolean> {
    try {
      const appointments = await firestoreService.getAppointmentsInRange(startDateTime, endDateTime);
      return appointments.length === 0;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to check slot availability: ${message}`);
    }
  }

  async getBookedSlots(date: string | Date): Promise<BookedSlot[]> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const appointments = await firestoreService.getAppointmentsInRange(
        startOfDay.toISOString(),
        endOfDay.toISOString()
      );

      return appointments.map(apt => ({
        start: apt.startDateTime,
        end: apt.endDateTime,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get booked slots: ${message}`);
    }
  }
}

export default new AvailabilityService();
