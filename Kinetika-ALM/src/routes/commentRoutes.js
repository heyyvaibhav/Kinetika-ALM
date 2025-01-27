const express = require('express');
const CommentsController = require('../controllers/commentsController');

const router = express.Router();

router.get('/:id/comments', CommentsController.getCommentsByIssueId);
router.post('/:id/comments', CommentsController.addComment);

module.exports = router;
