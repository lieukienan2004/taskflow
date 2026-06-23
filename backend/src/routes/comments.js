const express = require('express');
const router = express.Router({ mergeParams: true });
const auth = require('../middleware/auth');
const { getTimeline, createComment, deleteComment } = require('../controllers/commentController');

router.use(auth);
router.get('/', getTimeline);
router.post('/', createComment);
router.delete('/:id', deleteComment);

module.exports = router;
