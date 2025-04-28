const db = require('../config/dbConfig');
require('dotenv').config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.cloudinary_cloudName,
  api_key: process.env.cloudinary_api_key,
  api_secret: process.env.cloudinary_secret_key,
});

const getPublicIdFromUrl = (url) => {
  const parts = url.split("/");
  let publicId = "";
  const resourceType = parts[parts.indexOf("upload") - 1];
  if (resourceType == "image" || resourceType == "video") {
    publicId = parts[parts.length - 1].split(".")[0];
  } else {
    publicId = parts[parts.length - 1];
  }

  return { publicId, resourceType };
};

// Issues Model
const IssuesModel = {
  createIssue: async (issueData) => {
    const query = `
      INSERT INTO issues (project_id, issue_key, summary, description, flagged, issue_type_id, status, priority, reporter_id, assignee_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      issueData.project_id,
      issueData.issue_key,
      issueData.summary,
      issueData.description,
      issueData.flagged,
      issueData.issue_type_id,
      issueData.status || '1',
      issueData.priority || 'Medium',
      issueData.reporter_id,
      issueData.assignee_id,
    ];

    const result = await db.query(query, values);
    const issueId = result.insertId;

    const historyQuery = `
        INSERT INTO issuehistory (issue_id, updated_by, old_value, new_value, field_changed)
        VALUES (?, ?, ?, ?, ?)
    `;

    const historyValues = [
        issueId,
        issueData.reporter_id, // Assuming the reporter is the creator
        null, // No old value for a new issue
        JSON.stringify({
            summary: issueData.summary,
            description: issueData.description,
            status: issueData.status || '1',
            priority: issueData.priority || 'Medium',
            assignee_id: issueData.assignee_id,
        }),
        'Issue Created',
    ];

    await db.query(historyQuery, historyValues);
    return result;
  },

  getIssuesByProject: async (projectIds, filters = {}) => {
    const placeholders = projectIds.map(() => "?").join(", "); // Create ?,?,? for IN clause
    let query = `
    SELECT 
        i.*,
        reporter.full_name AS reporter_name,
        assignee.full_name AS assignee_name,
        COALESCE(comment_counts.comment_count, 0) AS comment,
        COALESCE(attachment_counts.attachment_count, 0) AS attachment
    FROM 
        issues i
    LEFT JOIN 
        users reporter ON i.reporter_id = reporter.user_id
    LEFT JOIN 
        users assignee ON i.assignee_id = assignee.user_id
    LEFT JOIN 
        (
            SELECT issue_id, COUNT(*) AS comment_count
            FROM comments
            GROUP BY issue_id
        ) comment_counts ON i.issue_id = comment_counts.issue_id
    LEFT JOIN 
        (
            SELECT issue_id, COUNT(*) AS attachment_count
            FROM attachments
            GROUP BY issue_id
        ) attachment_counts ON i.issue_id = attachment_counts.issue_id
    WHERE 
        i.project_id IN (${placeholders})
    `;

    let queryParams = [...projectIds];

    // Apply filters dynamically
    if (filters.priority) {
        query += " AND i.priority = ?";
        queryParams.push(filters.priority);
    }
    if (filters.status) {
        query += " AND i.status = ?";
        queryParams.push(filters.status);
    }
    if (filters.assignee) {
        query += " AND i.assignee_id = ?";
        queryParams.push(filters.assignee);
    }
    if (filters.reporter) {
        query += " AND i.reporter_id = ?";
        queryParams.push(filters.reporter);
    }

    return db.query(query, queryParams);
  },

  getIssueById: async (issueId) => {
    const query = `
      SELECT * FROM issues WHERE issue_id = ?
    `;
    return db.query(query, [issueId]);
  },

  updateIssue: async (issueId, updateData) => {
    const currentData = await db.query(
        'SELECT description, status, priority, assignee_id FROM issues WHERE issue_id = ?',
        [issueId]
    );

    if (!currentData) {
        throw new Error('Issue not found');
    }

    const oldData = currentData[0];

    // Update the issue
    const query = `
        UPDATE issues 
        SET  description = ?, status = ?, priority = ?, assignee_id = ?, updated_at = NOW()
        WHERE issue_id = ?
    `;
    const values = [
        // updateData.summary,
        updateData.description,
        // updateData.issue_type_id,
        updateData.status,
        updateData.priority,
        updateData.assignee_id,
        issueId,
    ];
    await db.query(query, values);

    // Prepare history insertion
    const historyQuery = `
        INSERT INTO issuehistory (issue_id, updated_by, old_value, new_value, field_changed)
        VALUES (?, ?, ?, ?, ?)
    `;

    // Define changes to track as separate entries
    const changes = [
      { field: 'description', old: oldData.description, new: updateData.description },
      { field: 'status', old: oldData.status, new: updateData.status },
      { field: 'priority', old: oldData.priority, new: updateData.priority },
      { field: 'assignee', old: oldData.assignee_id, new: updateData.assignee_id }
    ];

    // Insert separate history records for each field change
    for (const change of changes) {
      if (change.old != change.new) {
          const historyValues = [
              issueId,
              updateData.userid, 
              change.old ? change.old.toString() : null,
              change.new ? change.new.toString() : null,
              change.field,
          ];
          await db.query(historyQuery, historyValues);
      }
    }
  },

  deleteIssue: async (issueId) => {
    try {
      const issue = await db.query('SELECT file_path FROM attachments WHERE issue_id = ?', [issueId]);

      if (issue.length > 0) {
        for (let attachment of issue) {
          const { publicId, resourceType } = getPublicIdFromUrl(attachment.file_path)
          const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
            invalidate: "true",
          });
          if (result.result == "ok" || result.result == "not found") {
            await db.query('DELETE FROM attachments WHERE issue_id = ?', [issueId]);
          }
        }
      }
  
      await db.query('DELETE FROM comments WHERE issue_id = ?', [issueId]);

      await db.query('DELETE FROM issueHistory WHERE issue_id = ?', [issueId]);

      const res = await db.query('DELETE FROM issues WHERE issue_id = ?', [issueId]);
  
      return res; 
    } catch (error) {
      throw error;
    }
  },

  generateIssueKey: async (projectId, prefix) => {
    const selectQuery = `
      SELECT current_number FROM issuekeys WHERE project_id = ? AND issue_key_prefix = ?
    `;
    const updateQuery = `
      UPDATE issuekeys SET current_number = current_number + 1 WHERE project_id = ? AND issue_key_prefix = ?
    `;
    const insertQuery = `
      INSERT INTO issuekeys (project_id, issue_key_prefix, current_number) VALUES (?, ?, 1)
      ON DUPLICATE KEY UPDATE current_number = current_number + 1
    `;

    const [keyRow] = await db.query(selectQuery, [projectId, prefix]);
    if (!keyRow) {
      await db.query(insertQuery, [projectId, prefix]);
      return `${prefix}-1`;
    }

    await db.query(updateQuery, [projectId, prefix]);
    return `${prefix}-${keyRow.current_number + 1}`;
  },
};

module.exports = IssuesModel;
