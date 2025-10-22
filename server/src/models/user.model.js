class User {
    constructor(data) {
      this.email = data.email;
      this.name = data.name;
      this.phone = data.phone;
      this.role = data.role || 'user'; // 'user' or 'admin'
      this.tokens = data.tokens || null;
    }
  
    isAdmin() {
      return this.role === 'admin';
    }
  
    toJSON() {
      return {
        email: this.email,
        name: this.name,
        phone: this.phone,
        role: this.role,
      };
    }
  }
  
  module.exports = User;