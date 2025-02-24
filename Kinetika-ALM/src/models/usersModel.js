const db = require('../config/dbConfig');
const bcrypt = require("bcryptjs");
const axios = require("axios");
const microserviceUrl = process.env.microservice_url;

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
    const { username, email, full_name, role } = data;

      const generateRandomPassword = () => {
        const characters =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        let password = "";
        const passwordLength = 8;
      
        for (let i = 0; i < passwordLength; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          password += characters[randomIndex];
        }
      
        return password;
      };
      
      const randomPassword = generateRandomPassword();
      const passwordhash = await bcrypt.hash(randomPassword, 10);

      console.log(randomPassword);
      console.log(passwordhash);

        // Check if a user with the same email or username already exists
        const checkQuery = 'SELECT COUNT(*) AS count FROM users WHERE email = ? OR username = ?';
        const [existing] = await db.query(checkQuery, [email, username]);

        if (existing.count > 0) {
            return { exists: true };
        }

        // Insert the new user into the database
        const insertQuery = `
            INSERT INTO users (username, email, password_hash, full_name, role)
            VALUES (?, ?, ?, ?, ?)
        `;
        const result = await db.query(insertQuery, [  
            username,
            email,
            passwordhash,
            full_name,
            role,
        ]);

        const insertId = result.insertId;

        // Call the microservice to send an email
        try {
            const microserviceResponse = await axios.post(`${microserviceUrl}/user-creation`, {
                user: {
                    email: email,
                    name: full_name,
                    password : randomPassword,
                },
            });

            return {
                exists: false,
                insertId,
                emailSent: microserviceResponse.status === 200,
            };
        } catch (error) {
            console.error('Error calling microservice:', error);
            return {
                exists: false,
                insertId,
                emailSent: false,
                microserviceError: error.message,
            };
        }
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
