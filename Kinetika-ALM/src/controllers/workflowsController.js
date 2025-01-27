const WorkflowsModel = require('../models/workflowsModel');
const { successResponse, errorResponse } = require('../views/responseHandler');

class WorkflowsController {
  static async getAllWorkflows(req, res) {
    try {
      const workflows = await WorkflowsModel.getAllWorkflows();
      successResponse(res, workflows, 'Workflows retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  }

  static async createWorkflow(req, res) {
    try {
      const workflowId = await WorkflowsModel.createWorkflow(req.body);
      successResponse(res, { workflow_id: workflowId }, 'Workflow created successfully', 201);
    } catch (error) {
      errorResponse(res, error.message);
    }
  }
}

module.exports = WorkflowsController;
