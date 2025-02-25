require("dotenv").config();

module.exports = {
  email: {
    host: "smtp.zoho.com",
    port: 465, // Use 465 for SSL or 587 for TLS
    secure: true, // true for SSL, false for TLS
    auth: {
      user: "vaibhav.a@kinetikalabs.com", // GoDaddy email
      pass: "vaibhava@15", // GoDaddy email password
    },
  },
};