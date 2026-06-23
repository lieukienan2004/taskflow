const express = require('express');
const router = express.Router({ mergeParams: true });
const auth = require('../middleware/auth');
const { getSubtasks, createSubtask, updateSubtask, deleteSubtask } = require('../controllers/subtaskController');

router.use(auth);
router.get('/', getSubtasks);
router.post('/', createSubtask);
router.put('/:id', updateSubtask);
router.delete('/:id', deleteSubtask);

module.exports = router;
