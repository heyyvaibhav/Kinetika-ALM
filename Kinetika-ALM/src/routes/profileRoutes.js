const express = require("express");
const { authenticateToken } = require("../auth"); // Import authenticateToken
const db = require('../config/dbConfig');
const bcrypt = require("bcryptjs");
const { body, param, validationResult } = require("express-validator");

const router = express.Router();

// Get user profile
router.get("/getProfile/:id", async (req, res) => {
  const profileId = req.params.id;

  const profileQuery =
    `SELECT ws.full_name, COALESCE(wsi.MobileNumber, 'N/A') AS MobileNumber, ws.email, COALESCE(wsi.Address, 'N/A') AS Address, 
      COALESCE(wsi.DOB, 'N/A') AS DOB, 
      COALESCE(wsi.State, 'N/A') AS State, 
      COALESCE(wsi.City, 'N/A') AS City, 
      COALESCE(wsi.BIO, 'N/A') AS BIO, 
      COALESCE(wsi.ProfileImage, 'default.png') AS ProfileImage FROM users AS ws 
      LEFT JOIN web_user_info AS wsi ON wsi.UserID = ws.user_id WHERE ws.user_id = ?`;

  try {
    const results = await db.query(profileQuery, [profileId]);
    res.status(200).json(results[0] || {});
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "An error occurred while fetching the profile" });
  }
});

// Update user profile
router.put(
  "/updateProfile/:id",
  authenticateToken,
  [
    body("Name").notEmpty().withMessage("Name is required"),
    body("MobileNumber").notEmpty().withMessage("MobileNumber is required"),
    body("Email").isEmail().withMessage("Valid Email is required"),
    body("Address").notEmpty().withMessage("Address is required"),
    body("DOB").isDate().withMessage("Valid Date of Birth is required"),
    body("BIO").notEmpty().withMessage("Bio is required"),
    body("City").notEmpty().withMessage("City is required"),
    body("State").notEmpty().withMessage("State is required"),
    body("ProfileImage").notEmpty().withMessage("ProfileImage is required"),
  ],
  async (req, res) => {
    const profileId = req.params.id;
    const {
      Name,
      MobileNumber,
      Email,
      Address,
      DOB,
      State,
      City,
      BIO,
      ProfileImage,
    } = req.body;

    const updateWebUser = "UPDATE users SET full_name = ?, email = ? WHERE user_id = ?";
    const selectWebUserInfo = "SELECT COUNT(*) AS recordCount FROM web_user_info WHERE UserID = ?";
    const insertWebUserInfo =
      "INSERT INTO web_user_info (Address, DOB, State, City, BIO, ProfileImage, UserID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const updateWebUserInfo =
      "UPDATE web_user_info SET Address = ?, DOB = ?, State = ?, City = ?, BIO = ?, ProfileImage = ? WHERE UserID = ?";

    try {
      await db.query(updateWebUser, [Name, MobileNumber, Email, profileId]);

      const [[{ recordCount }]] = await db.query(selectWebUserInfo, [profileId]);

      if (recordCount > 0) {
        await db.query(updateWebUserInfo, [
          Address,
          DOB,
          State,
          City,
          BIO,
          ProfileImage,
          profileId,
        ]);
      } else {
        await db.query(insertWebUserInfo, [
          Address,
          DOB,
          State,
          City,
          BIO,
          ProfileImage,
          profileId,
        ]);
      }

      res.status(200).json({ message: "Profile updated successfully" });
    } catch (err) {
      console.error("Error updating profile:", err);
      res.status(500).json({ error: "An error occurred while updating the profile" });
    }
  }
);

// Change password
router.post(
  "/changePassword/:id",
  authenticateToken,
  [
    body("currentPassword").notEmpty().withMessage("Password is required"),
    body("newPassword").notEmpty().withMessage("New Password is required"),
  ],
  async (req, res) => {
    const userId = req.params.id;
    const { currentPassword, newPassword } = req.body;

    const getUserQuery = "SELECT password_hash FROM users WHERE user_id = ?";
    const updatePasswordQuery = "UPDATE users SET password_hash = ? WHERE user_id = ?";

    try {
      const [user] = await db.query(getUserQuery, [userId]);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);

      if (!passwordMatch) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db.query(updatePasswordQuery, [hashedPassword, userId]);

      res.status(200).json({ message: "Password changed successfully" });
    } catch (err) {
      console.error("Error changing password:", err);
      res.status(500).json({ error: "An error occurred while changing the password" });
    }
  }
);

// Delete profile picture
router.delete("/deleteProfilePicture/:id", async (req, res) => {
  const profileId = req.params.id;

  const deleteProfileImageQuery = "UPDATE web_user_info SET ProfileImage = NULL WHERE UserID = ?";

  try {
    await db.query(deleteProfileImageQuery, [profileId]);
    res.status(200).json({ message: "Profile picture deleted successfully" });
  } catch (err) {
    console.error("Error deleting profile picture:", err);
    res.status(500).json({ error: "An error occurred while deleting the profile picture" });
  }
});

module.exports = router;