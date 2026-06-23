const express = require('express');
const router = express.Router();
const { parseAndCreateTask, decomposeTask, chatCoach, generateQuizFromNote, analyzeProductivity } = require('../controllers/aiController');
const auth = require('../middleware/auth');

router.use(auth);
router.post('/quick-task', parseAndCreateTask);
router.post('/decompose', decomposeTask);
router.post('/coach', chatCoach);
router.post('/quiz-from-note', generateQuizFromNote);
router.get('/productivity', analyzeProductivity);

module.exports = router;
