// models/issueHistoryModel.js
const mysql = require('mysql');
const dbConfig = require('../config/dbConfig');
 

class IssueHistoryModel {
  // Method to retrieve history by issue ID
  static async getHistoryByIssueId(issueId) {
    try {
      const [rows] = await dbConfig.execute(
        'SELECT * FROM issuehistory WHERE issue_id = ? ORDER BY updated_at DESC',
        [issueId]
      );
      return rows;
    } catch (error) {
      console.error('Error fetching issue history:', error);
      throw error;
    }
  }

  // Method to insert a new history record
  static async insertHistory(issueId, updatedBy, oldValue, newValue, fieldChanged) {
    try {
      const [result] = await dbConfig.execute(
        'INSERT INTO issuehistory (issue_id, updated_by, old_value, new_value, field_changed) VALUES (?, ?, ?, ?, ?)',
        [issueId, updatedBy, oldValue, newValue, fieldChanged]
      );
      console.log('New issue history record inserted:', result);
      return result;
    } catch (error) {
      console.error('Error inserting issue history record:', error);
      throw error;
    }
  }
}

module.exports = IssueHistoryModel;
