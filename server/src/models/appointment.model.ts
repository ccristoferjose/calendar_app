import businessConfig from '../config/business.config.js';
import type {
  AppointmentData,
  AppointmentJSON,
  ParsedAppointment,
  ValidationResult,
  DateTimeObject,
  Attendee,
  Reminders
} from '../types/index.js';

class Appointment {
  summary: string;
  description: string;
  location: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  service: string;
  status: string;
  start: DateTimeObject;
  end: DateTimeObject;
  attendees: Attendee[];
  colorId: string;
  reminders: Reminders;

  constructor(data: AppointmentData) {
    this.summary = data.summary || `Appointment - ${data.customerName}`;
    this.location = data.location || '';
    this.customerName = data.customerName;
    this.customerEmail = data.customerEmail;
    this.customerPhone = data.customerPhone;
    this.service = data.service || 'General Appointment';
    this.status = data.status || 'confirmed';

    this.start = {
      dateTime: data.startDateTime,
      timeZone: businessConfig.timezone,
    };
    this.end = {
      dateTime: data.endDateTime,
      timeZone: businessConfig.timezone,
    };

    this.description = this.buildDescription(data);

    this.attendees = data.customerEmail ? [
      { email: data.customerEmail, displayName: data.customerName }
    ] : [];

    this.colorId = '1';

    this.reminders = {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'email', minutes: 60 },
      ],
    };
  }

  private buildDescription(data: AppointmentData): string {
    return `
Customer: ${data.customerName}
Email: ${data.customerEmail || 'N/A'}
Phone: ${data.customerPhone || 'N/A'}
Service: ${data.service || 'General Appointment'}
Status: ${data.status || 'confirmed'}
${data.description ? '\nNotes: ' + data.description : ''}
    `.trim();
  }

  validate(): ValidationResult {
    const errors: string[] = [];

    if (!this.customerName) {
      errors.push('Customer name is required');
    }

    if (!this.customerEmail && !this.customerPhone) {
      errors.push('Customer email or phone is required');
    }

    if (!this.start.dateTime) {
      errors.push('Start date/time is required');
    }

    if (!this.end.dateTime) {
      errors.push('End date/time is required');
    }

    const startDate = new Date(this.start.dateTime);
    const endDate = new Date(this.end.dateTime);

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

  toJSON(): AppointmentJSON {
    return {
      summary: this.summary,
      location: this.location,
      description: this.description,
      start: this.start,
      end: this.end,
      attendees: this.attendees,
      reminders: this.reminders,
      colorId: this.colorId,
    };
  }

  static fromFirestoreDoc(id: string, data: Record<string, unknown>): ParsedAppointment {
    return {
      id,
      customerName: data.customerName as string || 'Unknown',
      customerEmail: data.customerEmail as string || null,
      customerPhone: data.customerPhone as string || null,
      service: data.service as string || 'General Appointment',
      status: data.status as string || 'confirmed',
      startDateTime: data.startDateTime as string || '',
      endDateTime: data.endDateTime as string || '',
      location: data.location as string || undefined,
      created: data.createdAt as string || undefined,
      updated: data.updatedAt as string || undefined,
    };
  }
}

export default Appointment;
