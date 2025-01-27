const express = require('express');
const WorkflowsController = require('../controllers/workflowsController');

const router = express.Router();

router.get('/', WorkflowsController.getAllWorkflows);
router.post('/', WorkflowsController.createWorkflow);

module.exports = router;
