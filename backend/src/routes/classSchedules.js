const express = require('express');
const router = express.Router();
const { getClassSchedules, createClassSchedule, updateClassSchedule, deleteClassSchedule } = require('../controllers/classScheduleController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', getClassSchedules);
router.post('/', createClassSchedule);
router.put('/:id', updateClassSchedule);
router.delete('/:id', deleteClassSchedule);

module.exports = router;
