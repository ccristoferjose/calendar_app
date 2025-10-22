const businessConfig = require('../config/business.config');

class Appointment {
  constructor(data) {
    this.summary = data.summary || `Appointment - ${data.customerName}`;
    this.description = data.description || '';
    this.location = data.location || '';
    
    // Customer information
    this.customerName = data.customerName;
    this.customerEmail = data.customerEmail;
    this.customerPhone = data.customerPhone;
    
    // Appointment details
    this.service = data.service || 'General Appointment';
    this.status = data.status || 'confirmed'; // confirmed, cancelled, completed
    
    // Time slots
    this.start = {
      dateTime: data.startDateTime,
      timeZone: businessConfig.timezone,
    };
    this.end = {
      dateTime: data.endDateTime,
      timeZone: businessConfig.timezone,
    };
    
    // Store customer info in description for Google Calendar
    this.description = this.buildDescription(data);
    
    // Add customer email to attendees
    this.attendees = data.customerEmail ? [
      { email: data.customerEmail, displayName: data.customerName }
    ] : [];
    
    // Color coding (optional)
    this.colorId = data.colorId || '1'; // Different colors for different services
    
    this.reminders = {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 day before
        { method: 'email', minutes: 60 },      // 1 hour before
      ],
    };
  }

  buildDescription(data) {
    return `
Customer: ${data.customerName}
Email: ${data.customerEmail || 'N/A'}
Phone: ${data.customerPhone || 'N/A'}
Service: ${data.service || 'General Appointment'}
Status: ${data.status || 'confirmed'}
${data.description ? '\nNotes: ' + data.description : ''}
    `.trim();
  }

  validate() {
    const errors = [];
    
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
    
    // Validate business hours
    const startHour = startDate.getHours();
    const endHour = endDate.getHours();
    
    if (startHour < businessConfig.openHour || startHour >= businessConfig.closeHour) {
      errors.push(`Appointments must be between ${businessConfig.openHour}:00 and ${businessConfig.closeHour}:00`);
    }
    
    // Validate appointment duration
    const duration = (endDate - startDate) / (1000 * 60); // minutes
    if (duration !== businessConfig.appointmentDuration) {
      errors.push(`Appointment must be ${businessConfig.appointmentDuration} minutes long`);
    }
    
    // Validate day of week
    const dayOfWeek = startDate.getDay();
    if (!businessConfig.operatingDays.includes(dayOfWeek)) {
      errors.push('Appointments are not available on this day');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toJSON() {
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

  // Parse Google Calendar event back to appointment format
  static fromCalendarEvent(event) {
    // Extract customer info from description
    const description = event.description || '';
    const customerName = description.match(/Customer: (.+)/)?.[1] || 'Unknown';
    const customerEmail = description.match(/Email: (.+)/)?.[1] || '';
    const customerPhone = description.match(/Phone: (.+)/)?.[1] || '';
    const service = description.match(/Service: (.+)/)?.[1] || 'General Appointment';
    const status = description.match(/Status: (.+)/)?.[1] || 'confirmed';
    
    return {
      id: event.id,
      customerName,
      customerEmail: customerEmail !== 'N/A' ? customerEmail : null,
      customerPhone: customerPhone !== 'N/A' ? customerPhone : null,
      service,
      status,
      startDateTime: event.start.dateTime || event.start.date,
      endDateTime: event.end.dateTime || event.end.date,
      location: event.location,
      created: event.created,
      updated: event.updated,
    };
  }
}

module.exports = Appointment;