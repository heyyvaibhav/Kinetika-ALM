const db = require('../config/dbConfig');

class UsersModel {
  static async getAllUsers() {
    const rows = await db.query('SELECT user_id, full_name, email, FailedLoginAttempts, Status, role, created_at FROM users');
    return rows;
  }

  static async getUserById(id) {
    const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [id]);
    return rows[0];
  }

  static async createUser(data) {
    const { username, email, password_hash, full_name, role } = data;
    const result = await db.query(
      'INSERT INTO users (username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
      [username, email, password_hash, full_name, role]
    );
    return result.insertId;
  }

  static async updateUser(id, data) {
    const { username, email, password_hash, full_name, role } = data;
    await db.query(
      'UPDATE users SET username = ?, email = ?, password_hash = ?, full_name = ?, role = ? WHERE user_id = ?',
      [username, email, password_hash, full_name, role, id]
    );
  }

  static async deleteUser(id) {
    await db.query('DELETE FROM users WHERE user_id = ?', [id]);
  }
}

module.exports = UsersModel;
