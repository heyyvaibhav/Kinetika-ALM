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
    const { filename, filesize,  fileurl, uploaded_by } = data;
    const result = await db.query(
      'INSERT INTO attachments (issue_id, file_name, file_size, file_path, uploaded_by) VALUES (?, ?, ?, ?, ?)',
      [issueId, filename, filesize, fileurl, uploaded_by]
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

  static async deleteAttachment(attachmentId) {
      const rows = await db.query(
        'SELECT issue_id, file_name, file_path, uploaded_by FROM attachments WHERE attachment_id = ?',
        [attachmentId]
      );
  
      if (rows.length === 0) {
        throw new Error('Attachment not found');
      }
  
      const { issue_id, file_name, file_path, uploaded_by } = rows[0];

     
      const { publicId, resourceType } = getPublicIdFromUrl(file_path);

      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
        invalidate: "true",
      });

      if (result.result == "ok") {
        await db.query(
          'DELETE FROM attachments WHERE attachment_id = ?',
          [attachmentId]
        );

        const historyQuery = `
          INSERT INTO issuehistory (issue_id, updated_by, old_value, new_value, field_changed)
          VALUES (?, ?, ?, ?, ?)
        `;
        const historyValues = [
          issue_id,
          uploaded_by,
          file_name,
          null,
          'Attachment Removed',
        ];
    
        await db.query(historyQuery, historyValues);
        return { success: true, message: 'Attachment deleted successfully' };
      } else if (result.result == "not found") {
        return { success: false, message: 'Attachment not found', error: result.result };
      } else {
        return { success: false, message: 'Error ocurred in Cloudinary', error: result.result };
      }
  }
}

module.exports = AttachmentsModel;
