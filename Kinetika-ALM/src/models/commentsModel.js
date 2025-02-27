const db = require('../config/dbConfig');

class CommentsModel {
  static async getCommentsByIssueId(issueId) {
    console.log(issueId);
    const rows = await db.query(
      `
            SELECT 
                c.comment_id, 
                c.issue_id, 
                c.user_id, 
                c.comment_text, 
                c.created_at, 
                u.full_name AS username
            FROM comments c
            JOIN users u ON c.user_id = u.user_id
            WHERE c.issue_id = ?
            ORDER BY c.created_at DESC
        `,
      [issueId]
    );
    console.log(rows);
    return rows;
  }

  static async addComment(issueId, data) {
    const { user_id, comment_text } = data;
    const result = await db.query(
      'INSERT INTO comments (issue_id, user_id, comment_text) VALUES (?, ?, ?)',
      [issueId, user_id, comment_text]
    );
    const commentId = result.insertId;

    const historyQuery = `
        INSERT INTO issuehistory (issue_id, updated_by, old_value, new_value, field_changed)
        VALUES (?, ?, ?, ?, ?)
    `;
    const historyValues = [
        issueId,
        user_id,
        null,
        comment_text,
        'Comment Added',
    ];    

    await db.query(historyQuery, historyValues);    
    return commentId;
  }
}

module.exports = CommentsModel;
