const nodemailer = require("nodemailer");
const config = require("./config/config");

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure, // true for SSL (port 465)
  auth: {
    user: config.email.auth.user, // Make sure these values are correct
    pass: config.email.auth.pass,
  },
});

async function sendEmail(to, subject, html) {
  const mailOptions = {
    from: config.email.auth.user,
    to,
    subject,
    // text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

module.exports = { sendEmail };
