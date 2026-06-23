const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const timeLogController = require('../controllers/timeLogController');

router.get('/active', auth, timeLogController.getActive);
router.get('/stats', auth, timeLogController.getStats);
router.get('/by-task', auth, timeLogController.getByTaskStats);
router.get('/task/:taskId', auth, timeLogController.getByTask);
router.post('/start', auth, timeLogController.start);
router.post('/:id/stop', auth, timeLogController.stop);

module.exports = router;
