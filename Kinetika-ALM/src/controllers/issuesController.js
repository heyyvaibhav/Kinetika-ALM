const IssuesModel = require('../models/issuesModel');
const ProjectsModel = require('../models/projectsModel');

const IssuesController = {
  createIssue: async (req, res) => {
    try {
      const { project_id, summary, description, flagged, issue_type_id, priority, status, reporter_id, assignee_id } = req.body;
      const project = await ProjectsModel.getProjectById(project_id);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const prefix = project.project_key;
      const issue_key = await IssuesModel.generateIssueKey(project_id, prefix);

      const issueData = {
        project_id,
        issue_key,
        summary,
        description,
        flagged,
        issue_type_id,
        priority,
        status,
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
        const { project_ids, priority, status, assignee, reporter } = req.query;

        if (!project_ids) {
            return res.status(400).json({ success: false, message: "Project IDs are required" });
        }

        const projectIdsArray = project_ids.split(",").map(id => parseInt(id.trim(), 10));

        const filters = {};
        if (priority) filters.priority = priority;
        if (status) filters.status = status;
        if (assignee) filters.assignee = parseInt(assignee, 10);
        if (reporter) filters.reporter = parseInt(reporter, 10);

        const issues = await IssuesModel.getIssuesByProject(projectIdsArray, filters);

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
