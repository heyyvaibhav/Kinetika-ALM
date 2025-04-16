const express = require('express');
const AttachmentsController = require('../controllers/attachmentsController');

const router = express.Router();

router.get('/:id/attachments', AttachmentsController.getAttachmentsByIssueId);
router.post('/:id/attachments', AttachmentsController.uploadAttachment);
router.delete('/:id/attachments', AttachmentsController.deleteAttachment)

module.exports = router;
