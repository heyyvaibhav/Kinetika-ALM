const db = require('../config/dbConfig');

class AttachmentsModel {
  static async getAttachmentsByIssueId(issueId) {
    const rows = await db.query(
      `SELECT 
          a.*, 
          u.full_name as username
        FROM 
          attachments a
        JOIN 
          users u ON a.uploaded_by = u.user_id
        WHERE 
          a.issue_id = ?
        ORDER BY 
          a.uploaded_at DESC`,
      [issueId]
    );
    return rows;
  }

  static async uploadAttachment(issueId, data) {
    const { filename, fileurl, uploaded_by } = data;
    const result = await db.query(
      'INSERT INTO attachments (issue_id, file_name, file_path, uploaded_by) VALUES (?, ?, ?, ?)',
      [issueId, filename, fileurl, uploaded_by]
    );

    const historyQuery = `
        INSERT INTO issuehistory (issue_id, updated_by, old_value, new_value, field_changed)
        VALUES (?, ?, ?, ?, ?)
    `;
    const historyValues = [
        issueId,
        uploaded_by,
        null,
        filename,
        'Attachment Added',
    ];    

    await db.query(historyQuery, historyValues);    
    return result.insertId;
  }
}

module.exports = AttachmentsModel;
