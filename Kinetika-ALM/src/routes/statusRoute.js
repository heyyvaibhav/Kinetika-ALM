require("dotenv").config;
const express = require('express');
const router = express.Router();
const db = require('../config/dbConfig');

router.get("/", async (req, res) => {
    try {
        const statuses = await db.query("SELECT * FROM status_list ORDER BY ID ASC");

        res.status(200).json({ statuses });
    } catch (error) {
        console.error("Error fetching statuses:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/", async (req, res) => {
    try {
        const { name } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: "Status name is required" });
        }

        // Check if the table already has 10 entries
        const countResult = await db.query("SELECT COUNT(*) AS count FROM status_list");
        if (countResult >= 10) {
            return res.status(400).json({ error: "Maximum 10 entries allowed" });
        }

        // Insert the new status
        const result = await db.query("INSERT INTO status_list (Name) VALUES (?)", [name]);

        res.status(201).json({ message: "Status added successfully", id: result.insertId });
    } catch (error) {
        console.error("Error adding status:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/check/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const issues = await db.query("SELECT * FROM issues WHERE status = ?", [id]);
        if (issues.length > 0) {
            res.json({ issuesPresent: issues.length > 0,  message: "Warning: Issues are present!"});
        } else {
            res.json({ issuesPresent: issues.length > 0});
        }
    } catch (error) {
        console.error("Error checking issues:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.delete("/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { fallbackStatusId } = req.body;

        // Check if the status exists
        const status = await db.query("SELECT * FROM status_list WHERE ID = ?", [id]);
        if (status.length === 0) {
            return res.status(404).json({ error: "Status not found!" });
        }

        // Check if any issues are assigned to this status
        const issues = await db.query("SELECT * FROM issues WHERE status = ?", [id]);

        if (issues.length > 0) {
            // Validate fallbackStatusId only if issues are present
            if (!fallbackStatusId) {
                return res.status(400).json({ error: "Fallback status ID is required!" });
            }

            const fallbackStatus = await db.query("SELECT * FROM status_list WHERE ID = ?", [fallbackStatusId]);
            if (fallbackStatus.length === 0) {
                return res.status(404).json({ error: "Fallback status not found!" });
            }

            // Update issues with the fallback status
            await db.query("UPDATE issues SET status = ? WHERE status = ?", [fallbackStatusId, id]);
            await db.query("DELETE FROM status_list WHERE ID = ?", [id]);

            return res.status(200).json({ message: "Status deleted and issues updated successfully!" });
        }

        // Directly delete the status if no issues are present
        await db.query("DELETE FROM status_list WHERE ID = ?", [id]);
        res.status(200).json({ message: "Status deleted successfully!" });

    } catch (error) {
        console.error("Error deleting status:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


module.exports = router;