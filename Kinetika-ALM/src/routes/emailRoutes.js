const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

router.post("/user-creation", notificationController.sendUserCreationEmail);

router.post("/reset-password", notificationController.sendPasswordResetMail);

module.exports = router;
