const ProjectsModel = require('../models/projectsModel');
const IssuesModel = require('../models/issuesModel');

const ProjectsController = {
  // Get all projects
  getAllProjects: async (req, res) => {
    try {
      const leadId = req.query.lead;
      const projects = await ProjectsModel.getAllProjects(leadId);
      res.status(200).json(projects);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to retrieve projects' });
    }
  },

  // Get a project by ID
  getProjectById: async (req, res) => {
    try {
      const { id } = req.params;
      const project = await ProjectsModel.getProjectById(id);

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      res.status(200).json(project);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to retrieve the project' });
    }
  },

  // Create a new project
  createProject: async (req, res) => {
    try {
        const { project_key, project_name, project_description, lead_id } = req.body;

        if (!project_key || !project_name) {
            return res.status(400).json({ message: 'Project key and name are required' });
        }

        const result = await ProjectsModel.createProject({
            project_key,
            project_name,
            project_description,
            lead_id,
        });

        if (result.exists) {
            return res.status(200).json({ 
                message: 'Warning: Project with this key already exists', 
                warning: true 
            });
        }

        res.status(201).json({ 
            message: 'Project created successfully', 
            project_id: result.insertId 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create the project' });
    }
  },



  // Update a project
  updateProject: async (req, res) => {
    try {
      const { id } = req.params;
      const { project_key, project_name, project_description, lead_id } = req.body;

      const project = await ProjectsModel.getProjectById(id);

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      await ProjectsModel.updateProject(id, {
        project_key,
        project_name,
        project_description,
        lead_id,
      });

      res.status(200).json({ message: 'Project updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to update the project' });
    }
  },

  // Delete a project
  deleteProject: async (req, res) => {
    try {
      const { id } = req.params;

      const project = await ProjectsModel.getProjectById(id);

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Get all issue IDs linked to this project
      const issueIds = await ProjectsModel.getIssueIdsByProjectId(id);

      // Delete each issue using the existing deleteIssue logic
      for (let issueId of issueIds) {
        await IssuesModel.deleteIssue(issueId); // This already handles cleanup
      }

      // Now delete the project
      await ProjectsModel.deleteProject(id);

      res.status(200).json({ message: 'Project and related issues deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to delete the project and its issues' });
    }
  },
};

module.exports = ProjectsController;
