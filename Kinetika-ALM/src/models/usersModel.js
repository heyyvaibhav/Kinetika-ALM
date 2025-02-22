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

    // Check if a user with the same email already exists
    const checkQuery = 'SELECT COUNT(*) AS count FROM users WHERE email = ?';
    const [existing] = await db.query(checkQuery, [email]);

    if (existing.count > 0) {
        return { exists: true }; // Indicate that the user already exists
    }

    // Insert the new user if no conflict
    const insertQuery = `
        INSERT INTO users (username, email, password_hash, full_name, role)
        VALUES (?, ?, ?, ?, ?)
    `;
    const result = await db.query(insertQuery, [
        username,
        email,
        password_hash,
        full_name,
        role
    ]);

    return { exists: false, insertId: result.insertId }; // Return the new user ID
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
