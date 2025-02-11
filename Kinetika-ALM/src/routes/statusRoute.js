require("dotenv").config;
const express = require('express');
const router = express.Router();
const db = require('../config/dbConfig');

router.post("/", async (req, res) => {
    try {
        const { name } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: "Status name is required" });
        }

        // Check if the table already has 10 entries
        const countResult = await db.query("SELECT COUNT(*) AS count FROM Status_List");
        if (countResult >= 10) {
            return res.status(400).json({ error: "Maximum 10 entries allowed" });
        }

        // Insert the new status
        const result = await db.query("INSERT INTO Status_List (Name) VALUES (?)", [name]);

        res.status(201).json({ message: "Status added successfully", id: result.insertId });
    } catch (error) {
        console.error("Error adding status:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;