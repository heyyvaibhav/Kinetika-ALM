// routes/issueHistoryRoutes.js
const express = require('express');
const router = express.Router();
const { getIssueHistory, createIssueHistory } = require('../controllers/issueHistoryController');

// Route to get issue history by issue ID
router.get('/issuehistory/:issueId', getIssueHistory);

// Route to create a new issue history record
router.post('/issuehistory', createIssueHistory);

module.exports = router;
