const GoogleCalendarService = require('../services/google.service');
const Event = require('../models/event.model');

class CalendarController {
  static async listEvents(req, res) {
    try {
      const service = new GoogleCalendarService(req.session.tokens);
      const events = await service.listEvents();
      res.json({ success: true, events });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async createEvent(req, res) {
    try {
      const service = new GoogleCalendarService(req.session.tokens);
      const event = new Event(req.body);
      const createdEvent = await service.createEvent(event.toGoogleFormat());
      res.json({ success: true, event: createdEvent });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async updateEvent(req, res) {
    try {
      const { eventId } = req.params;
      const service = new GoogleCalendarService(req.session.tokens);
      const event = new Event(req.body);
      const updatedEvent = await service.updateEvent(eventId, event.toGoogleFormat());
      res.json({ success: true, event: updatedEvent });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async deleteEvent(req, res) {
    try {
      const { eventId } = req.params;
      const service = new GoogleCalendarService(req.session.tokens);
      await service.deleteEvent(eventId);
      res.json({ success: true, message: 'Event deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getEvent(req, res) {
    try {
      const { eventId } = req.params;
      const service = new GoogleCalendarService(req.session.tokens);
      const event = await service.getEvent(eventId);
      res.json({ success: true, event });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = CalendarController;