const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, awardXP, deductXP } = require('../controllers/gamificationController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/award-xp', awardXP);
router.post('/deduct-xp', deductXP);

module.exports = router;
