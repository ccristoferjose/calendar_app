const { google } = require('googleapis');
const { oauth2Client } = require('../config/google.config');

class GoogleCalendarService {
  constructor(tokens) {
    oauth2Client.setCredentials(tokens);
    this.calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  }

  async listEvents(timeMin = new Date().toISOString(), maxResults = 10) {
    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin,
        maxResults,
        singleEvents: true,
        orderBy: 'startTime'
      });
      return response.data.items;
    } catch (error) {
      throw new Error(`Failed to list events: ${error.message}`);
    }
  }

  async createEvent(eventData) {
    try {
      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: eventData
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create event: ${error.message}`);
    }
  }

  async updateEvent(eventId, eventData) {
    try {
      const response = await this.calendar.events.update({
        calendarId: 'primary',
        eventId,
        resource: eventData
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update event: ${error.message}`);
    }
  }

  async deleteEvent(eventId) {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId
      });
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete event: ${error.message}`);
    }
  }

  async getEvent(eventId) {
    try {
      const response = await this.calendar.events.get({
        calendarId: 'primary',
        eventId
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get event: ${error.message}`);
    }
  }
}

module.exports = GoogleCalendarService;