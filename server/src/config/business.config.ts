import 'dotenv/config';
import type { BusinessConfig } from '../types/index.js';

const businessConfig: BusinessConfig = {
  openHour: parseInt(process.env.BUSINESS_OPEN_HOUR || '8'),
  closeHour: parseInt(process.env.BUSINESS_CLOSE_HOUR || '17'),
  appointmentDuration: parseInt(process.env.APPOINTMENT_DURATION || '60'),
  timezone: process.env.TIMEZONE || 'America/Los_Angeles',
  operatingDays: [1, 2, 3, 4, 5],
  maxAppointmentsPerDay: 9,
  bufferTime: 0,
  maxAdvanceBookingDays: 30,
};

export default businessConfig;
