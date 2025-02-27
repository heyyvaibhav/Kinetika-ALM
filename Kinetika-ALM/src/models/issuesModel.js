const db = require('../config/dbConfig'); // Assume this is your DB connection file

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

  getIssuesByProject: async (projectIds) => {
    const placeholders = projectIds.map(() => "?").join(", "); // Create ?,?,? for IN clause
    const query = `SELECT 
    i.*,
    reporter.full_name AS reporter_name,
    assignee.full_name AS assignee_name
    FROM 
        issues i
    LEFT JOIN 
        users reporter ON i.reporter_id = reporter.user_id
    LEFT JOIN 
        users assignee ON i.assignee_id = assignee.user_id
    WHERE 
        i.project_id IN (${placeholders});
    `;
    
    return db.query(query, projectIds);
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
      if (change.old !== change.new) {
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
    const query = `
      DELETE FROM issues WHERE issue_id = ?
    `;
    return db.query(query, [issueId]);
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
