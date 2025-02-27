// models/issueHistoryModel.js
const mysql = require('mysql');
const dbConfig = require('../config/dbConfig');
 

class IssueHistoryModel {
  // Method to retrieve history by issue ID
  static async getHistoryByIssueId(issueId) {
    try {
      const rows = await dbConfig.query(
        `SELECT 
            ih.*,
            u.full_name AS username,
            CASE 
                WHEN ih.field_changed = 'assignee' AND ih.new_value IS NOT NULL 
                THEN (SELECT full_name FROM users WHERE user_id = ih.new_value) 
                ELSE ih.new_value 
            END AS new_value
        FROM issuehistory ih
        LEFT JOIN users u ON ih.updated_by = u.user_id
        WHERE ih.issue_id = ?
        ORDER BY ih.updated_at DESC
        `,
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
      const result = await dbConfig.query(
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
