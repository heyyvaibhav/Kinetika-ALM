const db = require('../config/dbConfig');

class CommentsModel {
  static async getCommentsByIssueId(issueId) {
    const [rows] = await db.query(
      'SELECT * FROM Comments WHERE issue_id = ? ORDER BY created_at DESC',
      [issueId]
    );
    return rows;
  }

  static async addComment(issueId, data) {
    const { user_id, comment_text } = data;
    const [result] = await db.query(
      'INSERT INTO Comments (issue_id, user_id, comment_text) VALUES (?, ?, ?)',
      [issueId, user_id, comment_text]
    );
    return result.insertId;
  }
}

module.exports = CommentsModel;
