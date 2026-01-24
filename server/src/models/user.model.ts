import type { UserData, UserRole, UserJSON } from '../types/index.js';

class User {
  email: string;
  name: string;
  phone?: string;
  role: UserRole;

  constructor(data: UserData) {
    this.email = data.email;
    this.name = data.name;
    this.phone = data.phone;
    this.role = data.role || 'user';
  }

  isAdmin(): boolean {
    return this.role === 'admin';
  }

  toJSON(): UserJSON {
    return {
      email: this.email,
      name: this.name,
      phone: this.phone,
      role: this.role,
    };
  }
}

export default User;
