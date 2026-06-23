const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getStats, getHeatmap, getTrends } = require('../controllers/statsController');

router.get('/', auth, getStats);
router.get('/heatmap', auth, getHeatmap);
router.get('/trends', auth, getTrends);

module.exports = router;
