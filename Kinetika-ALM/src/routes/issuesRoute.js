const express = require('express');
const IssuesController = require('../controllers/issuesController');

const router = express.Router();

// Route to create a new issue
router.post('/', IssuesController.createIssue);

// Route to get all issues by project ID
router.get('/projects', IssuesController.getIssuesByProject);

// Route to get an issue by its ID
router.get('/:issue_id', IssuesController.getIssueById);

// Route to update an issue by its ID
router.put('/:issue_id', IssuesController.updateIssue);

// Route to delete an issue by its ID
router.delete('/:issue_id', IssuesController.deleteIssue);

module.exports = router;
