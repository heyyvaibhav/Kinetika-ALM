const express = require("express");
const { authenticateToken } = require("../auth"); // Import authenticateToken
const db = require('../config/dbConfig');
const bcrypt = require("bcryptjs");
const { body, param, validationResult } = require("express-validator");
require('dotenv').config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.cloudinary_cloudName,
  api_key: process.env.cloudinary_api_key,
  api_secret: process.env.cloudinary_secret_key,
});

const getPublicIdFromUrl = (url) => {
  const parts = url.split("/");
  let publicId = "";
  const resourceType = parts[parts.indexOf("upload") - 1];
  if (resourceType == "image" || resourceType == "video") {
    publicId = parts[parts.length - 1].split(".")[0];
  } else {
    publicId = parts[parts.length - 1];
  }

  return { publicId, resourceType };
};

const router = express.Router();

// Get user profile
router.get("/getProfile/:id", async (req, res) => {
  const profileId = req.params.id;

  const profileQuery =
    `SELECT ws.full_name, ws.created_at, ws.Status, COALESCE(wsi.MobileNumber, 'N/A') AS MobileNumber, ws.email, COALESCE(wsi.Address, 'N/A') AS Address, 
      COALESCE(wsi.DOB, 'N/A') AS DOB, 
      COALESCE(wsi.State, 'N/A') AS State, 
      COALESCE(wsi.City, 'N/A') AS City, 
      COALESCE(wsi.BIO, 'N/A') AS BIO, 
      wsi.ProfileImage AS ProfileImage FROM users AS ws 
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
router.put("/updateProfile/:id", async (req, res) => {
    const profileId = req.params.id;
    const {
      MobileNumber,
      Address,
      DOB,
      State,
      City,
      BIO,
    } = req.body;

    const selectWebUserInfo = "SELECT COUNT(*) AS recordCount FROM web_user_info WHERE UserID = ?";
    const insertWebUserInfo =
      "INSERT INTO web_user_info (MobileNumber, Address, DOB, State, City, BIO, UserID) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const updateWebUserInfo =
      "UPDATE web_user_info SET MobileNumber = ?, Address = ?, DOB = ?, State = ?, City = ?, BIO = ? WHERE UserID = ?";

    try {
      
      const [{ recordCount }] = await db.query(selectWebUserInfo, [profileId]);
      if (recordCount > 0) {
        await db.query(updateWebUserInfo, [
          MobileNumber,
          Address,
          DOB,
          State,
          City,
          BIO,
          profileId,
        ]);
      } else {
        await db.query(insertWebUserInfo, [
          MobileNumber,
          Address,
          DOB,
          State,
          City,
          BIO,
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
router.post("/changePassword/:id", async (req, res) => {
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

// Upload profile picture
router.post("/picture/:id", async (req, res) => {
  const profileId = req.params.id;
  const { ProfileImage } = req.body;

  const selectWebUserInfo = "SELECT COUNT(*) AS recordCount FROM web_user_info WHERE UserID = ?";
  const insertWebUserInfo =
    "INSERT INTO web_user_info (ProfileImage, UserID) VALUES (?, ?)";
  const updateWebUserInfo =
    "UPDATE web_user_info SET ProfileImage = ? WHERE UserID = ?";

  try {
    const [{ recordCount }] = await db.query(selectWebUserInfo, [profileId]);
    if (recordCount > 0) {
      await db.query(updateWebUserInfo, [
        ProfileImage,
        profileId,
      ]);
    } else {
      await db.query(insertWebUserInfo, [
        ProfileImage,
        profileId,
      ]);
    }
    res.status(200).json({ message: "Profile picture saved successfully" });
  } catch (err) {
    console.error("Error uploading profile picture:", err);
    res.status(500).json({ error: "An error occurred while updating the profile" });
  }
});

// Delete profile picture
router.delete("/delete/:id", async (req, res) => {
  const profileId = req.params.id;

  try {
    const [rows] = await db.query(
      'SELECT ProfileImage FROM web_user_info WHERE UserID = ?',
      [profileId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { publicId, resourceType } = getPublicIdFromUrl(rows.ProfileImage);

    if (!publicId) {
      return res.status(400).json({ message: 'No profile image to delete' });
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: "true",
    });

    // if (result.result !== 'ok') {
    //   return res.status(500).json({ message: 'Cloudinary deletion failed', result });
    // }

    await db.query(
      'UPDATE web_user_info SET ProfileImage = NULL WHERE UserID = ?',
      [profileId]
    );

    res.status(200).json({ message: 'Profile image deleted successfully' });
  } catch (err) {
    console.error("Error deleting profile picture:", err);
    res.status(500).json({ error: "An error occurred while deleting the profile picture" });
  }
});

module.exports = router;