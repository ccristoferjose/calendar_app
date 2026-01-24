import type { Request, Response, NextFunction } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';
import type { Timestamp } from 'firebase-admin/firestore';

// User types
export type UserRole = 'user' | 'admin';

export interface UserData {
  email: string;
  name: string;
  phone?: string;
  role?: UserRole;
}

export interface UserJSON {
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
}

export interface FirebaseUser {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
}

// Appointment types
export type AppointmentStatus = 'confirmed' | 'cancelled' | 'completed';

export interface AppointmentData {
  summary?: string;
  description?: string;
  location?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  service?: string;
  status?: AppointmentStatus;
  startDateTime: string;
  endDateTime: string;
  date?: string;
  hour?: number;
}

export interface FirestoreAppointment {
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  service: string;
  status: AppointmentStatus;
  startDateTime: Timestamp | string;
  endDateTime: Timestamp | string;
  summary: string;
  description: string;
  location: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ParsedAppointment {
  id: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  service: string;
  status: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
  created?: string;
  updated?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Legacy types for models (kept for backward compatibility)
export interface DateTimeObject {
  dateTime: string;
  timeZone: string;
}

export interface Attendee {
  email: string;
  displayName?: string;
}

export interface ReminderOverride {
  method: 'email' | 'popup';
  minutes: number;
}

export interface Reminders {
  useDefault: boolean;
  overrides: ReminderOverride[];
}

export interface AppointmentJSON {
  summary: string;
  location: string;
  description: string;
  start: DateTimeObject;
  end: DateTimeObject;
  attendees: Attendee[];
  reminders: Reminders;
  colorId: string;
}

export interface EventData {
  summary: string;
  location?: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  timeZone?: string;
  attendees?: Attendee[];
  reminders?: ReminderOverride[];
}

export interface EventJSON {
  summary: string;
  location: string;
  description: string;
  start: DateTimeObject;
  end: DateTimeObject;
  attendees: Attendee[];
  reminders: Reminders;
}

// Time slot types
export interface TimeSlot {
  start: string;
  end: string;
  hour: number;
  label: string;
}

export interface AvailableSlot extends TimeSlot {
  available: boolean;
}

export interface DayAvailability {
  date: string;
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  slots: AvailableSlot[];
}

export interface WeekAvailability {
  startDate: string;
  endDate: string;
  availability: Record<string, DayAvailability>;
}

export interface BookedSlot {
  start: string;
  end: string;
}

export interface AppointmentTimes {
  startDateTime: string;
  endDateTime: string;
}

// Business config types
export interface BusinessConfig {
  openHour: number;
  closeHour: number;
  appointmentDuration: number;
  timezone: string;
  operatingDays: number[];
  maxAppointmentsPerDay: number;
  bufferTime: number;
  maxAdvanceBookingDays: number;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
}

export interface BookingResult extends ParsedAppointment {
  message: string;
}

export interface CancelResult {
  message: string;
  data?: ParsedAppointment;
}

export interface DashboardStats {
  today: {
    appointments: number;
    date: string;
  };
  thisWeek: {
    appointments: number;
    totalSlots: number;
    bookedSlots: number;
    availableSlots: number;
    occupancyRate: string;
  };
  upcomingAppointments: ParsedAppointment[];
}

// Extended Request types for Firebase Auth
export interface AuthenticatedRequest extends Request {
  user?: FirebaseUser;
  token?: DecodedIdToken;
}

export interface AdminRequest extends AuthenticatedRequest {
  isAdmin?: boolean;
}

// Middleware types
export type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;

export type AsyncMiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;
