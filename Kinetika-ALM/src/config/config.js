require("dotenv").config();

module.exports = {
  email: {
    host: "smtpout.secureserver.net",
    port: 465, // Use 465 for SSL or 587 for TLS
    secure: true, // true for SSL, false for TLS
    auth: {
      user: "noreply@nexushubs.in", // GoDaddy email
      pass: "Kedar123!", // GoDaddy email password
    },
  },
  msg91: {
    authKey: "437330ArWDUQB2ZuW677033a0P1", // Replace with your MSG91 Auth Key
    templateId: "67728538d6fc0509bb1cd5f3", // Replace with your MSG91 template ID
  },
};