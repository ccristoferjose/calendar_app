class Event {
    constructor(data) {
      this.summary = data.summary;
      this.description = data.description || '';
      this.location = data.location || '';
      this.start = data.start;
      this.end = data.end;
      this.attendees = data.attendees || [];
      this.reminders = data.reminders || {
        useDefault: true
      };
    }
  
    toGoogleFormat() {
      return {
        summary: this.summary,
        description: this.description,
        location: this.location,
        start: this.start,
        end: this.end,
        attendees: this.attendees,
        reminders: this.reminders
      };
    }
  
    static fromGoogleFormat(googleEvent) {
      return new Event({
        id: googleEvent.id,
        summary: googleEvent.summary,
        description: googleEvent.description,
        location: googleEvent.location,
        start: googleEvent.start,
        end: googleEvent.end,
        attendees: googleEvent.attendees,
        reminders: googleEvent.reminders
      });
    }
  }
  
  module.exports = Event;