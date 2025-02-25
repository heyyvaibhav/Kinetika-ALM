require("dotenv").config();

module.exports = {
  email: {
    host: "smtp.zoho.in",
    port: 587, // Use 587 for TLS
    secure: false, // false for TLS (STARTTLS)
    auth: {
      user: "almnotifications@kinetikalabs.com", // Zoho email
      pass: "Kedar135!", // Password or App-specific password
    },
    tls: {
      rejectUnauthorized: false, // Add this if facing certificate issues
    },
  },
};