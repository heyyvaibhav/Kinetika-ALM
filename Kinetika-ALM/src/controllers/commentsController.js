const CommentsModel = require('../models/commentsModel');
const { successResponse, errorResponse } = require('../views/responseHandler');

class CommentsController {
  static async getCommentsByIssueId(req, res) {
    try {
      const comments = await CommentsModel.getCommentsByIssueId(req.params.id);
      successResponse(res, comments, 'Comments retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  }

  static async addComment(req, res) {
    try {
      const commentId = await CommentsModel.addComment(req.params.id, req.body);
      successResponse(res, { comment_id: commentId }, 'Comment added successfully', 201);
    } catch (error) {
      errorResponse(res, error.message);
    }
  }
}

module.exports = CommentsController;
