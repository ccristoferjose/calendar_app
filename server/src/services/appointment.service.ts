import firestoreService from './firestore.service.js';
import availabilityService from './availability.service.js';
import businessConfig from '../config/business.config.js';
import type {
  AppointmentData,
  ParsedAppointment,
  BookingResult,
  CancelResult
} from '../types/index.js';

class AppointmentService {
  async createAppointment(appointmentData: AppointmentData): Promise<BookingResult> {
    const validation = this.validateAppointment(appointmentData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const isAvailable = await availabilityService.isSlotAvailable(
      appointmentData.startDateTime,
      appointmentData.endDateTime
    );

    if (!isAvailable) {
      throw new Error('This time slot is no longer available');
    }

    const appointment = await firestoreService.createAppointment(appointmentData);

    return {
      ...appointment,
      message: 'Appointment booked successfully'
    };
  }

  async getAllAppointments(
    timeMin?: string,
    timeMax?: string,
    maxResults: number = 100
  ): Promise<ParsedAppointment[]> {
    return firestoreService.getAllAppointments(timeMin, timeMax, maxResults);
  }

  async getAppointment(id: string): Promise<ParsedAppointment> {
    const appointment = await firestoreService.getAppointment(id);
    if (!appointment) {
      throw new Error('Appointment not found');
    }
    return appointment;
  }

  async updateAppointment(id: string, appointmentData: AppointmentData): Promise<ParsedAppointment> {
    const validation = this.validateAppointment(appointmentData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const appointment = await firestoreService.updateAppointment(id, appointmentData);
    if (!appointment) {
      throw new Error('Appointment not found');
    }
    return appointment;
  }

  async cancelAppointment(id: string, sendNotification: boolean = true): Promise<CancelResult> {
    if (sendNotification) {
      const appointment = await firestoreService.cancelAppointment(id);
      if (!appointment) {
        throw new Error('Appointment not found');
      }
      return {
        message: 'Appointment cancelled successfully',
        data: appointment
      };
    } else {
      const deleted = await firestoreService.deleteAppointment(id);
      if (!deleted) {
        throw new Error('Appointment not found');
      }
      return { message: 'Appointment deleted successfully' };
    }
  }

  async getCustomerAppointments(customerEmail: string): Promise<ParsedAppointment[]> {
    return firestoreService.getCustomerAppointments(customerEmail);
  }

  private validateAppointment(data: AppointmentData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.customerName) {
      errors.push('Customer name is required');
    }

    if (!data.customerEmail && !data.customerPhone) {
      errors.push('Customer email or phone is required');
    }

    if (!data.startDateTime) {
      errors.push('Start date/time is required');
    }

    if (!data.endDateTime) {
      errors.push('End date/time is required');
    }

    const startDate = new Date(data.startDateTime);
    const endDate = new Date(data.endDateTime);

    if (startDate >= endDate) {
      errors.push('End time must be after start time');
    }

    const startHour = startDate.getHours();
    if (startHour < businessConfig.openHour || startHour >= businessConfig.closeHour) {
      errors.push(`Appointments must be between ${businessConfig.openHour}:00 and ${businessConfig.closeHour}:00`);
    }

    const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
    if (duration !== businessConfig.appointmentDuration) {
      errors.push(`Appointment must be ${businessConfig.appointmentDuration} minutes long`);
    }

    const dayOfWeek = startDate.getDay();
    if (!businessConfig.operatingDays.includes(dayOfWeek)) {
      errors.push('Appointments are not available on this day');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default new AppointmentService();
