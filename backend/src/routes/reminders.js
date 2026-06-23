const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getUpcomingReminders, sendEmailReminder } = require('../controllers/reminderController');

router.get('/upcoming', auth, getUpcomingReminders);
router.post('/send-email', auth, sendEmailReminder);

module.exports = router;
