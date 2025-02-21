const express = require("express");
const { authenticateToken } = require("../auth"); // Import authenticateToken
const db = require('../config/dbConfig');

const router = express.Router();
const { body, param, validationResult } = require("express-validator");
const axios = require("axios");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const ResetUrlLink = process.env.ResetPassword;
const microserviceUrl = process.env.microservice_url;

// Function to check if a user exists by email
const checkIfUserExists = async (email) => {
  const query = `SELECT * FROM users WHERE email = ?`;
  const result = await db.query(query, [email]);
  return result.length > 0;
};

// Route for forgot-password with email validation
router.put(
  "/forgot-password/:email",
  async (req, res) => {
    const errors = validationResult(req);

    const email = req.params.email;

    console.log(ResetUrlLink);

    try {
      const userExists = await checkIfUserExists(email);
      if (!userExists) {
        return res.status(404).json({ message: "Invalid email ID" });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + 10);

      const query = `
        INSERT INTO passwordresettoken (Email, Token, CreateOn, ExpiryTime)
        VALUES (?, ?, NOW(), ?)
      `;
      await db.query(query, [email, token, expiryTime]);

      const resetUrl = `${ResetUrlLink}/${token}`;

      const microserviceResponse = await axios.post(
        `${microserviceUrl}/reset-password`,
        {
          user: {
            Email: email,
            resetUrl: resetUrl,
          },
        }
      );

      //   console.log("microservice: ", microserviceResponse);

      if (microserviceResponse.status === 200) {
        return res.status(200).json({
          message: "Password reset email sent successfully",
        });
      } else {
        return res.status(500).json({
          message: "Failed to send password reset email",
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: `Internal server error ${error}`,
        error: error.message,
      });
    }
  }
);

router.get("/validateToken/:token", async (req, res) => {
  const token = req.params.token;
  //   console.log("Token: ", token);

  try {
    // Query to check the token in the database
    const verifyTokenQuery = `
        SELECT * 
        FROM passwordresettoken
        WHERE token = ?
      `;

    const [queryResult] = await db.query(verifyTokenQuery, [token]);

    if (queryResult.length > 0) {
      const tokenData = queryResult[0];
      const currentTime = new Date();
      const expiryTime = new Date(tokenData.ExpiryTime);

      if (currentTime > expiryTime) {
        return res.status(400).json({
          message: "Token is expired",
        });
      }

      return res.status(200).json({
        message: "Token is valid",
        tokenData,
      });
    } else {
      return res.status(404).json({
        message: "Invalid token",
      });
    }
  } catch (error) {
  //  console.error("Error validating token:", error);
    return res.status(500).json({
      message: `Internal server error ${error}`,
      error: error.message,
    });
  }
});

router.put(
  "/resetPassword",
  [
    // Validate the `newPassword`
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number"),
    body("token").notEmpty().withMessage("Token is required"), // Validate the token
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { newPassword, token } = req.body;

    try {
      // Verify the token
      const verifyTokenQuery = `
        SELECT Email, ExpiryTime 
        FROM passwordresettoken 
        WHERE Token = ?
      `;
      const [tokenResult] = await db.query(verifyTokenQuery, [token]);

      if (tokenResult.length === 0) {
        return res.status(404).json({ message: "Invalid or expired token" });
      }

      const tokenData = tokenResult[0];
      const currentTime = new Date();
      const expiryTime = new Date(tokenData.ExpiryTime);

      if (currentTime > expiryTime) {
        return res.status(400).json({ message: "Token is expired" });
      }

      const userExists = await checkIfUserExists(tokenData.Email);
      if (!userExists) {
        return res.status(404).json({ message: "Invalid email ID" });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the password in the `web_user` table
      const updatePasswordQuery = `
        UPDATE users 
        SET password_hash = ? 
        WHERE email = ?
      `;
      await db.query(updatePasswordQuery, [hashedPassword, tokenData.Email]);

      // Remove the token from `passwordresettoken` table
      const deleteTokenQuery = `
        DELETE FROM passwordresettoken 
        WHERE Token = ?
      `;
      await db.query(deleteTokenQuery, [token]);

      return res.status(200).json({
        message: "Password updated successfully",
      });
    } catch (error) {
      //console.error("Error updating password:", error);
      return res.status(500).json({
        message: `Internal server error ${error}`,
        error: error.message,
      });
    }
  }
);

module.exports = router;
