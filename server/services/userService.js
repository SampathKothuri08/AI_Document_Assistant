// In-memory user storage for development
// In production, this would be replaced with a database service
const users = new Map();

class UserService {
  static async create(userData) {
    const user = {
      id: userData.id,
      email: userData.email,
      password: userData.password,
      name: userData.name,
      createdAt: new Date().toISOString()
    };
    
    users.set(user.id, user);
    return user;
  }

  static async findByEmail(email) {
    for (const user of users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  static async findById(id) {
    return users.get(id) || null;
  }

  static async update(id, updates) {
    const user = users.get(id);
    if (!user) return null;
    
    const updatedUser = { ...user, ...updates };
    users.set(id, updatedUser);
    return updatedUser;
  }

  static async delete(id) {
    return users.delete(id);
  }

  static async list() {
    return Array.from(users.values()).map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    }));
  }
}

module.exports = { UserService }; 