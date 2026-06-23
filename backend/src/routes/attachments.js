const express = require('express');
const router = express.Router({ mergeParams: true });
const auth = require('../middleware/auth');
const uploadAttachment = require('../middleware/uploadAttachment');
const { getAttachments, uploadAttachment: uploadCtrl, deleteAttachment, downloadAttachment, addLinkAttachment } = require('../controllers/attachmentController');

router.use(auth);
router.get('/', getAttachments);
router.post('/', uploadAttachment.single('file'), uploadCtrl);
router.post('/link', addLinkAttachment);
router.delete('/:id', deleteAttachment);
router.get('/:id/download', downloadAttachment);

module.exports = router;
