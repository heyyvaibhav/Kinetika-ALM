const IssuesModel = require('../models/issuesModel');

const IssuesController = {
  createIssue: async (req, res) => {
    try {
      const { project_id, summary, description, issue_type_id, priority, reporter_id, assignee_id } = req.body;
      const prefix = `PROJ${project_id}`; // Customize prefix logic as needed
      const issue_key = await IssuesModel.generateIssueKey(project_id, prefix);

      const issueData = {
        project_id,
        issue_key,
        summary,
        description,
        issue_type_id,
        priority,
        reporter_id,
        assignee_id,
      };

      const result = await IssuesModel.createIssue(issueData);
      res.status(201).json({ success: true, issue_id: result.insertId, issue_key });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to create issue' });
    }
  },

  getIssuesByProject: async (req, res) => {
    try {
      const { project_ids } = req.query; // Expecting comma-separated values like "101,102,103"
  
      if (!project_ids) {
        return res.status(400).json({ success: false, message: "Project IDs are required" });
      }
  
      const projectIdsArray = project_ids.split(",").map(id => parseInt(id.trim(), 10)); // Convert to array of numbers
  
      const issues = await IssuesModel.getIssuesByProject(projectIdsArray);
      
      res.status(200).json({ success: true, issues });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Failed to fetch issues" });
    }
  },
  
  

  getIssueById: async (req, res) => {
    try {
      const { issue_id } = req.params;
      const [issue] = await IssuesModel.getIssueById(issue_id);
      if (!issue) {
        return res.status(404).json({ success: false, message: 'Issue not found' });
      }
      res.status(200).json({ success: true, issue });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to fetch issue' });
    }
  },

  updateIssue: async (req, res) => {
    try {
      const { issue_id } = req.params;
      const updateData = req.body;

      await IssuesModel.updateIssue(issue_id, updateData);
      res.status(200).json({ success: true, message: 'Issue updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to update issue' });
    }
  },

  deleteIssue: async (req, res) => {
    try {
      const { issue_id } = req.params;

      await IssuesModel.deleteIssue(issue_id);
      res.status(200).json({ success: true, message: 'Issue deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to delete issue' });
    }
  },
};

module.exports = IssuesController;
