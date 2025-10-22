require('dotenv').config();

const businessConfig = {
  openHour: parseInt(process.env.BUSINESS_OPEN_HOUR) || 8,
  closeHour: parseInt(process.env.BUSINESS_CLOSE_HOUR) || 17,
  appointmentDuration: parseInt(process.env.APPOINTMENT_DURATION) || 60, // minutes
  timezone: process.env.TIMEZONE || 'America/Los_Angeles',
  
  // Days of operation (0 = Sunday, 6 = Saturday)
  operatingDays: [1, 2, 3, 4, 5], // Monday to Friday
  
  // Maximum appointments per day
  maxAppointmentsPerDay: 9, // 8 AM to 5 PM = 9 slots
  
  // Buffer time between appointments (minutes)
  bufferTime: 0,
  
  // How many days in advance can users book
  maxAdvanceBookingDays: 30,
};

module.exports = businessConfig;