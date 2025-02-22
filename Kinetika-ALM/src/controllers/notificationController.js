const emailService = require("../emailService");
const templates = require("../models/templates");
const { db } = require("../config/dbConfig");
const { default: axios } = require("axios");
const { body, validationResult } = require("express-validator");

async function logMessage(emailAddress, phoneNumber, subject, body, status, type) {
  const insertQuery = `
    INSERT INTO communication_logs (email_address, phone_number, subject, body, send_status, message_type)
    VALUES (?, ?, ?, ?, ?, ?)
    `;
  const values = [emailAddress, phoneNumber, subject, body, status, type];

  try {
    const result = await db.query(insertQuery, values);
    // console.log('Message log inserted with ID:', result.insertId);
  } catch (error) {
    // console.error('Error logging message:', error);
  }
}


exports.sendPasswordResetMail = async (req, res) => {
  const { user } = req.body;
  try {
    const emailTemplate = templates.PasswordReset(user);

    // Attempt to send the email and wait for the response
    const sendResult = await emailService.sendEmail(
      user.Email,
      emailTemplate.subject,
      emailTemplate.body
    );

    const emailStatus = sendResult.accepted && sendResult.accepted.includes(user.email) ? 'Success' : 'Failed';
    // Log the email
    await logMessage(user.Email, null, emailTemplate.subject, emailTemplate.body, emailStatus, 'Email');

    if (sendResult.accepted && sendResult.accepted.includes(user.Email)) {
      res
        .status(200)
        .json({ message: "Password Reset email sent successfully." });
    } else {
      res.status(500).json({
        message:
          "Failed to send email. Email service did not confirm delivery.",
      });
    }
  } catch (error) {
    // Log error and send a 500 status response if there was an error
    console.error("Error sending Password Reset email:", error);
    res.status(500).json({
      message: "Error occurred while sending email.",
      error: error.message,
    });
  }
};

exports.sendUserCreationEmail = async (req, res) => {
  const { user } = req.body;
  // console.log("user: ", user);

  try {
    // Generate email template content
    const emailTemplate = templates.userCreationEmail(user);

    // Attempt to send the email and wait for the response
    const sendResult = await emailService.sendEmail(
      user.email,
      emailTemplate.subject,
      emailTemplate.body
    );

    const emailStatus = sendResult.accepted && sendResult.accepted.includes(user.email) ? 'Success' : 'Failed';
    // Log the email
    await logMessage(user.email, null, emailTemplate.subject, emailTemplate.body, emailStatus, 'Email');

    // Check for successful send status based on service response
    if (sendResult.accepted && sendResult.accepted.includes(user.email)) {
      res
        .status(200)
        .json({ message: "User creation email sent successfully." });
    } else {
      res.status(500).json({
        message:
          "Failed to send email. Email service did not confirm delivery.",
      });
    }
  } catch (error) {
    // Log error and send a 500 status response if there was an error
    console.error("Error sending user creation email:", error);
    res.status(500).json({
      message: "Error occurred while sending email.",
      error: error.message,
    });
  }
};

