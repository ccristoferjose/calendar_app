const { getCalendar } = require('../config/google.config');
const Event = require('../models/event.model');

class CalendarService {
  
  // List events
  async listEvents(maxResults = 10) {
    try {
      const calendar = getCalendar();
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });
      
      return response.data.items;
    } catch (error) {
      throw new Error(`Failed to list events: ${error.message}`);
    }
  }

  // Get single event
  async getEvent(eventId) {
    try {
      const calendar = getCalendar();
      const response = await calendar.events.get({
        calendarId: 'primary',
        eventId: eventId,
      });
      
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get event: ${error.message}`);
    }
  }

  // Create event
  async createEvent(eventData) {
    try {
      const event = new Event(eventData);
      const validation = event.validate();
      
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const calendar = getCalendar();
      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event.toJSON(),
      });
      
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create event: ${error.message}`);
    }
  }

  // Update event
  async updateEvent(eventId, eventData) {
    try {
      const event = new Event(eventData);
      const validation = event.validate();
      
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const calendar = getCalendar();
      const response = await calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: event.toJSON(),
      });
      
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update event: ${error.message}`);
    }
  }

  // Delete event
  async deleteEvent(eventId) {
    try {
      const calendar = getCalendar();
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });
      
      return { message: 'Event deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete event: ${error.message}`);
    }
  }
}

module.exports = new CalendarService();