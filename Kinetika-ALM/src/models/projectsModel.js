const db = require('../config/dbConfig');  // Assuming you have a configured database connection module

const ProjectsModel = {
  // Retrieve all projects
  getAllProjects: async () => {
    const query = 'SELECT p.*, u.full_name AS lead_name FROM projects p JOIN users u ON p.lead_id = u.user_id';
    const results = await db.query(query);
    return results;
  },

  // Retrieve a project by ID
  getProjectById: async (projectId) => {
    const query = 'SELECT * FROM projects WHERE project_id = ?';
    const [results] = await db.query(query, [projectId]);
    return results[0]; // Return a single project
  },

  // Create a new project
  createProject: async (projectData) => {
    // Check if project with the same key already exists
    const checkQuery = `SELECT COUNT(*) AS count FROM projects WHERE project_key = ?`;
    const [existing] = await db.query(checkQuery, [projectData.project_key]);

    if (existing.count > 0) {
        throw new Error("Project with this key already exists");
    }

    // Insert new project
    const insertQuery = `
      INSERT INTO projects (project_key, project_name, project_description, lead_id)
      VALUES (?, ?, ?, ?)
    `;
    const result = await db.query(insertQuery, [
      projectData.project_key,
      projectData.project_name,
      projectData.project_description,
      projectData.lead_id,
    ]);
    return result.insertId; // Return the ID of the newly created project
  },

  // Update an existing project
  updateProject: async (projectId, projectData) => {
    const query = `
      UPDATE projects
      SET project_key = ?, project_name = ?, project_description = ?, lead_id = ?
      WHERE project_id = ?
    `;
    await db.query(query, [
      projectData.project_key,
      projectData.project_name,
      projectData.project_description,
      projectData.lead_id,
      projectId,
    ]);
    return true;
  },

  // Delete a project
  deleteProject: async (projectId) => {
    const query = 'DELETE FROM projects WHERE project_id = ?';
    await db.query(query, [projectId]);
    return true;
  },
};

module.exports = ProjectsModel;
