import type {
  EventData,
  EventJSON,
  ValidationResult,
  DateTimeObject,
  Attendee,
  Reminders
} from '../types/index.js';

class Event {
  summary: string;
  location: string;
  description: string;
  start: DateTimeObject;
  end: DateTimeObject;
  attendees: Attendee[];
  reminders: Reminders;

  constructor(data: EventData) {
    this.summary = data.summary;
    this.location = data.location || '';
    this.description = data.description || '';
    this.start = {
      dateTime: data.startDateTime,
      timeZone: data.timeZone || 'America/Los_Angeles',
    };
    this.end = {
      dateTime: data.endDateTime,
      timeZone: data.timeZone || 'America/Los_Angeles',
    };
    this.attendees = data.attendees || [];
    this.reminders = {
      useDefault: false,
      overrides: data.reminders || [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 10 },
      ],
    };
  }

  validate(): ValidationResult {
    const errors: string[] = [];

    if (!this.summary) {
      errors.push('Summary is required');
    }

    if (!this.start.dateTime) {
      errors.push('Start date/time is required');
    }

    if (!this.end.dateTime) {
      errors.push('End date/time is required');
    }

    if (new Date(this.start.dateTime) >= new Date(this.end.dateTime)) {
      errors.push('End time must be after start time');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toJSON(): EventJSON {
    return {
      summary: this.summary,
      location: this.location,
      description: this.description,
      start: this.start,
      end: this.end,
      attendees: this.attendees,
      reminders: this.reminders
    };
  }
}

export default Event;
