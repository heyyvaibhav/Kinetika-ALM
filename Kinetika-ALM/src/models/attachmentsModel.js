const db = require('../config/dbConfig');

class AttachmentsModel {
  static async getAttachmentsByIssueId(issueId) {
    const [rows] = await db.query(
      'SELECT * FROM Attachments WHERE issue_id = ? ORDER BY uploaded_at DESC',
      [issueId]
    );
    return rows;
  }

  static async uploadAttachment(issueId, data) {
    const { filename, file_url, uploaded_by } = data;
    const [result] = await db.query(
      'INSERT INTO Attachments (issue_id, filename, file_url, uploaded_by) VALUES (?, ?, ?, ?)',
      [issueId, filename, file_url, uploaded_by]
    );
    return result.insertId;
  }
}

module.exports = AttachmentsModel;
