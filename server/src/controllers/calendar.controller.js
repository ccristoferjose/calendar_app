const calendarService = require('../services/calendar.service');

class CalendarController {
  
  // GET /api/events - List all events
  async listEvents(req, res) {
    try {
      const maxResults = parseInt(req.query.maxResults) || 10;
      const events = await calendarService.listEvents(maxResults);
      
      res.json({
        success: true,
        count: events.length,
        data: events
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/events/:id - Get single event
  async getEvent(req, res) {
    try {
      const { id } = req.params;
      const event = await calendarService.getEvent(id);
      
      res.json({
        success: true,
        data: event
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }

  // POST /api/events - Create event
  async createEvent(req, res) {
    try {
      const eventData = req.body;
      const event = await calendarService.createEvent(eventData);
      
      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: event
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // PUT /api/events/:id - Update event
  async updateEvent(req, res) {
    try {
      const { id } = req.params;
      const eventData = req.body;
      const event = await calendarService.updateEvent(id, eventData);
      
      res.json({
        success: true,
        message: 'Event updated successfully',
        data: event
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // DELETE /api/events/:id - Delete event
  async deleteEvent(req, res) {
    try {
      const { id } = req.params;
      await calendarService.deleteEvent(id);
      
      res.json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new CalendarController();