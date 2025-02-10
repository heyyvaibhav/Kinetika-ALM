require("dotenv").config;
const express = require("express");
const bcrypt = require("bcryptjs");
const jwtToken = require("../auth");
const db = require('../config/dbConfig');

const router = express.Router();

let login_attempts = 0;

router.post("/login", async (req, res) => {
  const { email_id, Password } = req.body;

  if (!email_id || !Password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    // Await the result of the query execution
    const [rows] =   await db.query("SELECT * FROM users WHERE email = ?", [
      email_id,
    ]);
 
    // Check if user is found
    if (rows) {
      const user = rows; // Access the first user object from the array

      // Check if the account is active
      if (user.Status !== "Active") {
        return res.status(400).json({
          message: "Your account has been disabled. Please contact admin.",
        });
      }

      // Compare the hashed password
      const passwordMatch = await bcrypt.compare(Password, user.password_hash);

      if (passwordMatch) {
        const token = jwtToken.generateToken(user);

        // Reset the failed login attempts
        login_attempts = 0;
        await db.query(
          "UPDATE users SET FailedLoginAttempts = ? WHERE email = ?",
          [login_attempts, email_id]
        );

        return res.status(200).json({
          message: "Login successful.",
          userId: user.user_id,
          UserType: user.role,
          token: token,
        });
      } else {
        // return res.status(401).json({ message: "Incorrect password." });

        login_attempts = user["FailedLoginAttempts"] + 1;
        if (login_attempts >= 3) {
          const DisableStatus = "Disabled";
          await db.query(
            "UPDATE users SET Status = ?, FailedLoginAttempts = ? WHERE email = ?",
            [DisableStatus, login_attempts, email_id]
          );
        } else {
          await db.query(
            "UPDATE users SET FailedLoginAttempts = ? WHERE email = ?",
            [login_attempts, email_id]
          );
        }
        return res.status(401).json({ message: "Invalid credentials" });
      }
    } else {
      return res.status(401).json({ message: "No User Account Found" });
    }
  } catch (err) {
    console.error("Error during login process:", err);
    return res.status(500).json({ message: "Server error.", error: err });
  }
});

module.exports = router;
