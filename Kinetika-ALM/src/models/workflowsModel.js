const db = require('../config/dbConfig');

class WorkflowsModel {
  static async getAllWorkflows() {
    const [rows] = await db.query('SELECT * FROM Workflows');
    return rows;
  }

  static async createWorkflow(data) {
    const { name, steps } = data; // Assuming `steps` is a JSON field
    const [result] = await db.query(
      'INSERT INTO Workflows (name, steps) VALUES (?, ?)',
      [name, JSON.stringify(steps)]
    );
    return result.insertId;
  }
}

module.exports = WorkflowsModel;
