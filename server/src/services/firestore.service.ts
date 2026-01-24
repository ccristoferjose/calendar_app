import { db } from '../config/firebase.config.js';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import type {
  AppointmentData,
  ParsedAppointment,
  AppointmentStatus,
  FirestoreAppointment,
  UserData,
  UserRole
} from '../types/index.js';

const APPOINTMENTS_COLLECTION = 'appointments';
const USERS_COLLECTION = 'users';

class FirestoreService {
  // Appointments

  async createAppointment(data: AppointmentData): Promise<ParsedAppointment> {
    const docRef = db.collection(APPOINTMENTS_COLLECTION).doc();

    const appointment: FirestoreAppointment = {
      customerName: data.customerName,
      customerEmail: data.customerEmail || null,
      customerPhone: data.customerPhone || null,
      service: data.service || 'General Appointment',
      status: data.status || 'confirmed',
      startDateTime: Timestamp.fromDate(new Date(data.startDateTime)),
      endDateTime: Timestamp.fromDate(new Date(data.endDateTime)),
      summary: data.summary || `Appointment - ${data.customerName}`,
      description: data.description || '',
      location: data.location || '',
      createdAt: FieldValue.serverTimestamp() as Timestamp,
      updatedAt: FieldValue.serverTimestamp() as Timestamp,
    };

    await docRef.set(appointment);

    return this.toParsedAppointment(docRef.id, appointment);
  }

  async getAppointment(id: string): Promise<ParsedAppointment | null> {
    const doc = await db.collection(APPOINTMENTS_COLLECTION).doc(id).get();

    if (!doc.exists) {
      return null;
    }

    return this.toParsedAppointment(doc.id, doc.data() as FirestoreAppointment);
  }

  async getAllAppointments(
    timeMin?: string,
    timeMax?: string,
    maxResults: number = 100
  ): Promise<ParsedAppointment[]> {
    let query = db.collection(APPOINTMENTS_COLLECTION)
      .orderBy('startDateTime', 'asc')
      .limit(maxResults);

    if (timeMin) {
      query = query.where('startDateTime', '>=', Timestamp.fromDate(new Date(timeMin)));
    }

    if (timeMax) {
      query = query.where('startDateTime', '<=', Timestamp.fromDate(new Date(timeMax)));
    }

    const snapshot = await query.get();

    return snapshot.docs.map(doc =>
      this.toParsedAppointment(doc.id, doc.data() as FirestoreAppointment)
    );
  }

  async updateAppointment(id: string, data: Partial<AppointmentData>): Promise<ParsedAppointment | null> {
    const docRef = db.collection(APPOINTMENTS_COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return null;
    }

    const updateData: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (data.customerName) updateData.customerName = data.customerName;
    if (data.customerEmail !== undefined) updateData.customerEmail = data.customerEmail;
    if (data.customerPhone !== undefined) updateData.customerPhone = data.customerPhone;
    if (data.service) updateData.service = data.service;
    if (data.status) updateData.status = data.status;
    if (data.startDateTime) updateData.startDateTime = Timestamp.fromDate(new Date(data.startDateTime));
    if (data.endDateTime) updateData.endDateTime = Timestamp.fromDate(new Date(data.endDateTime));
    if (data.summary) updateData.summary = data.summary;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.location !== undefined) updateData.location = data.location;

    await docRef.update(updateData);

    const updated = await docRef.get();
    return this.toParsedAppointment(updated.id, updated.data() as FirestoreAppointment);
  }

  async deleteAppointment(id: string): Promise<boolean> {
    const docRef = db.collection(APPOINTMENTS_COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return false;
    }

    await docRef.delete();
    return true;
  }

  async cancelAppointment(id: string): Promise<ParsedAppointment | null> {
    return this.updateAppointment(id, { status: 'cancelled' });
  }

  async getCustomerAppointments(customerEmail: string): Promise<ParsedAppointment[]> {
    const snapshot = await db.collection(APPOINTMENTS_COLLECTION)
      .where('customerEmail', '==', customerEmail)
      .where('startDateTime', '>=', Timestamp.now())
      .orderBy('startDateTime', 'asc')
      .get();

    return snapshot.docs.map(doc =>
      this.toParsedAppointment(doc.id, doc.data() as FirestoreAppointment)
    );
  }

  async getAppointmentsInRange(startDateTime: string, endDateTime: string): Promise<ParsedAppointment[]> {
    const snapshot = await db.collection(APPOINTMENTS_COLLECTION)
      .where('startDateTime', '>=', Timestamp.fromDate(new Date(startDateTime)))
      .where('startDateTime', '<', Timestamp.fromDate(new Date(endDateTime)))
      .where('status', '!=', 'cancelled')
      .get();

    return snapshot.docs.map(doc =>
      this.toParsedAppointment(doc.id, doc.data() as FirestoreAppointment)
    );
  }

  // Users

  async createUser(uid: string, data: { email: string; name: string; role?: UserRole }): Promise<void> {
    await db.collection(USERS_COLLECTION).doc(uid).set({
      email: data.email,
      name: data.name,
      role: data.role || 'user',
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  async getUser(uid: string): Promise<UserData | null> {
    const doc = await db.collection(USERS_COLLECTION).doc(uid).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data();
    return {
      email: data?.email,
      name: data?.name,
      role: data?.role || 'user',
    };
  }

  async getUserByEmail(email: string): Promise<{ uid: string; data: UserData } | null> {
    const snapshot = await db.collection(USERS_COLLECTION)
      .where('email', '==', email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      uid: doc.id,
      data: {
        email: doc.data().email,
        name: doc.data().name,
        role: doc.data().role || 'user',
      }
    };
  }

  async updateUserRole(uid: string, role: UserRole): Promise<void> {
    await db.collection(USERS_COLLECTION).doc(uid).update({ role });
  }

  // Helpers

  private toParsedAppointment(id: string, data: FirestoreAppointment): ParsedAppointment {
    return {
      id,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      service: data.service,
      status: data.status,
      startDateTime: data.startDateTime instanceof Timestamp
        ? data.startDateTime.toDate().toISOString()
        : data.startDateTime,
      endDateTime: data.endDateTime instanceof Timestamp
        ? data.endDateTime.toDate().toISOString()
        : data.endDateTime,
      location: data.location,
      created: data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : undefined,
      updated: data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : undefined,
    };
  }
}

export default new FirestoreService();
