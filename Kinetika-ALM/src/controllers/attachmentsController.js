const AttachmentsModel = require('../models/attachmentsModel');
const { successResponse, errorResponse } = require('../views/responseHandler');

class AttachmentsController {
  static async getAttachmentsByIssueId(req, res) {
    try {
      const attachments = await AttachmentsModel.getAttachmentsByIssueId(req.params.id);
      successResponse(res, attachments, 'Attachments retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  }

  static async uploadAttachment(req, res) {
    try {
      const attachmentId = await AttachmentsModel.uploadAttachment(req.params.id, req.body);
      successResponse(res, { attachment_id: attachmentId }, 'Attachment uploaded successfully', 201);
    } catch (error) {
      errorResponse(res, error.message);
    }
  }

  static async deleteAttachment(req, res) {
    try {
      const attachmentId = await AttachmentsModel.deleteAttachment(req.params.id, req.params.attachment_id);
      if (attachmentId.success) {
        successResponse(res, { attachment_id: attachmentId }, 'Attachment deleted successfully', 200);
      } else if (attachmentId.error === "not found") {
        errorResponse(res, attachmentId.error, attachmentId.message, 404 );
      } else {
        errorResponse(res, attachmentId.error, attachmentId.message, 500 );
      }
    } catch (error) {
      errorResponse(res, error.message);
    }
  }
}

module.exports = AttachmentsController;
