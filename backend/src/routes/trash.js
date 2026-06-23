const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getTrash, restoreTask, permanentDelete, emptyTrash } = require('../controllers/trashController');

router.use(auth);
router.get('/', getTrash);
router.put('/:id/restore', restoreTask);
router.delete('/:id', permanentDelete);
router.delete('/', emptyTrash);

module.exports = router;
